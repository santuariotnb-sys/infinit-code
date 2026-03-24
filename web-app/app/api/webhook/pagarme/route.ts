import { NextRequest, NextResponse }          from 'next/server';
import { createClient }                       from '@supabase/supabase-js';
import { createHmac }                         from 'crypto';
import { createLicenseKey, revokeLicenseKey } from '@/lib/license';
import { sendEmail }                          from '@/lib/emails';

// Service role — bypassa RLS para operações de webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ── VERIFICAÇÃO DE ASSINATURA ───────────────────────────────
function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.PAGARME_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[webhook] PAGARME_WEBHOOK_SECRET não configurado — verificação ignorada em dev');
    return true;
  }
  // Pagar.me V5 envia sha1= no header x-hub-signature
  const expected = 'sha1=' + createHmac('sha1', secret).update(body).digest('hex');
  return signature === expected;
}

// ── HELPERS ─────────────────────────────────────────────────
async function getOrCreateUser(email: string, name?: string): Promise<string> {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) return (existing as { id: string }).id;

  const { data, error } = await supabase
    .from('users')
    .insert({ email, name: name ?? email.split('@')[0] })
    .select('id')
    .single();

  if (error || !data) throw new Error(`Erro ao criar user: ${error?.message}`);
  return (data as { id: string }).id;
}

async function logEvent(
  userId: string | null,
  type: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await supabase.from('events').insert({ user_id: userId, type, metadata });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ── HANDLERS POR EVENTO ─────────────────────────────────────

async function handleSubscriptionCreated(data: Record<string, unknown>) {
  const customer = data.customer as Record<string, string>;
  const email    = customer.email;
  const name     = customer.name;

  if (!email) throw new Error('customer.email ausente');

  const userId = await getOrCreateUser(email, name);

  // Verifica se é reativação (tinha assinatura cancelada)
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const isReactivation = (existingSub as { status?: string } | null)?.status === 'canceled';

  const periodEnd = addDays(new Date(), 30);

  await supabase.from('subscriptions').upsert({
    user_id:                 userId,
    pagarme_customer_id:     customer.id,
    pagarme_subscription_id: data.id as string,
    pagarme_plan_id:         (data.plan as Record<string, string>)?.id,
    status:                  'active',
    payment_method:          (data.payment_method as string) ?? 'credit_card',
    period_start:            new Date().toISOString(),
    period_end:              periodEnd.toISOString(),
    updated_at:              new Date().toISOString(),
  }, { onConflict: 'pagarme_subscription_id' });

  // Reativação gera nova chave, revogando a anterior
  if (isReactivation) await revokeLicenseKey(userId);
  const key = await createLicenseKey(userId);

  await logEvent(userId, isReactivation ? 'reactivated' : 'purchased', {
    subscription_id: data.id,
    plan_id: (data.plan as Record<string, string>)?.id,
  });

  await sendEmail(isReactivation ? 'reativacao' : 'boas_vindas', {
    to: email, name, licenseKey: key,
  });
}

async function handleInvoicePaid(data: Record<string, unknown>) {
  const subscriptionId = data.subscription_id as string;
  if (!subscriptionId) return;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, users(email, name)')
    .eq('pagarme_subscription_id', subscriptionId)
    .single();

  if (!sub) {
    console.warn('[webhook] invoice.paid — subscription não encontrada:', subscriptionId);
    return;
  }

  const user    = (sub as { users: Record<string, string> }).users;
  const userId  = (sub as { user_id: string }).user_id;
  const periodEnd = addDays(new Date(), 30);

  await supabase.from('subscriptions').update({
    status:     'active',
    period_end: periodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('pagarme_subscription_id', subscriptionId);

  const charges = data.charges as Record<string, unknown>[] | undefined;
  const charge  = charges?.[0];

  await supabase.from('payments').insert({
    user_id:            userId,
    pagarme_charge_id:  charge?.id as string | null,
    pagarme_invoice_id: data.id as string | null,
    amount_cents:       typeof data.amount === 'number' ? data.amount * 100 : 6700,
    payment_method:     charge?.payment_method as string ?? 'credit_card',
    status:             'paid',
    type:               'renewal',
    paid_at:            new Date().toISOString(),
  });

  await logEvent(userId, 'renewed', { subscription_id: subscriptionId });

  await sendEmail('renovacao_confirmada', {
    to:      user.email,
    name:    user.name,
    amount:  'R$67,00', // TODO: usar data.amount quando confirmar campo exato do Pagar.me V5
    nextDate: periodEnd.toLocaleDateString('pt-BR'),
  });
}

async function handleInvoicePaymentFailed(data: Record<string, unknown>) {
  const subscriptionId = data.subscription_id as string;
  if (!subscriptionId) return;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id, users(email, name)')
    .eq('pagarme_subscription_id', subscriptionId)
    .single();

  if (!sub) return;

  const user   = (sub as { users: Record<string, string> }).users;
  const userId = (sub as { user_id: string }).user_id;

  await supabase.from('subscriptions').update({
    status:     'past_due',
    updated_at: new Date().toISOString(),
  }).eq('pagarme_subscription_id', subscriptionId);

  await logEvent(userId, 'payment_failed', {
    subscription_id: subscriptionId,
    invoice_id: data.id,
  });

  await sendEmail('pagamento_falhou', { to: user.email, name: user.name });
}

async function handleSubscriptionCanceled(data: Record<string, unknown>) {
  const subscriptionId = data.id as string;
  if (!subscriptionId) return;

  // cancel_at_cycle_end pode vir como boolean ou int (0/1) dependendo da versão da API
  const cancelAtEnd = data.cancel_at_cycle_end === true || data.cancel_at_cycle_end === 1;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id, users(email, name)')
    .eq('pagarme_subscription_id', subscriptionId)
    .single();

  if (!sub) return;

  const user   = (sub as { users: Record<string, string> }).users;
  const userId = (sub as { user_id: string }).user_id;

  await supabase.from('subscriptions').update({
    status:              'canceled',
    cancel_at_cycle_end: cancelAtEnd,
    updated_at:          new Date().toISOString(),
  }).eq('pagarme_subscription_id', subscriptionId);

  // Revoga licença imediatamente apenas se não for cancelamento no fim do ciclo
  if (!cancelAtEnd) {
    await revokeLicenseKey(userId);
  }

  await logEvent(userId, 'canceled', {
    subscription_id: subscriptionId,
    cancel_at_end:   cancelAtEnd,
  });

  await sendEmail('cancelamento_confirmado', { to: user.email, name: user.name });
}

async function handleChargeWaitingPayment(data: Record<string, unknown>) {
  const customer      = data.customer as Record<string, string> | undefined;
  const transaction   = (data.last_transaction as Record<string, unknown>) ?? {};
  const paymentMethod = data.payment_method as string;

  if (!customer?.email) return;

  if (paymentMethod === 'pix') {
    const expiresAt = transaction.expires_at
      ? new Date(transaction.expires_at as string).toLocaleString('pt-BR')
      : 'em 24 horas';

    await sendEmail('pix_pendente', {
      to:         customer.email,
      pixQrCode:  transaction.qr_code_url as string,
      // TODO: confirmar campo exato — pode ser qr_code, pix_qr_code
      pixExpires: expiresAt,
    });
  }

  if (paymentMethod === 'boleto') {
    await sendEmail('boleto_gerado', {
      to:        customer.email,
      boletoUrl: transaction.pdf as string,
      // TODO: confirmar campo exato — pode ser boleto_url, url
    });
  }
}

// ── ROUTE HANDLER ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get('x-hub-signature') ?? '';

  if (!verifySignature(body, signature)) {
    console.error('[webhook/pagarme] Assinatura inválida');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = event.type as string;
  const data = event.data as Record<string, unknown>;

  console.log(`[webhook/pagarme] ${type}`);

  try {
    switch (type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(data);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(data);
        break;
      case 'subscription.canceled':
        await handleSubscriptionCanceled(data);
        break;
      case 'charge.waiting_payment':
        await handleChargeWaitingPayment(data);
        break;
      default:
        console.log(`[webhook/pagarme] Evento ignorado: ${type}`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error(`[webhook/pagarme] Erro em ${type}:`, err);
    // Retorna 200 para o Pagar.me não retentar em loop
    return NextResponse.json({ received: true, error: String(err) });
  }
}
