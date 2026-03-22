// app/api/billing/portal/route.ts
// Redireciona o usuário para o portal de assinatura do Pagar.me
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const PAGARME_API = 'https://api.pagar.me/core/v5';
const PAGARME_KEY = process.env.PAGARME_SECRET_KEY!;
const auth = () => ({
  Authorization: `Basic ${Buffer.from(PAGARME_KEY + ':').toString('base64')}`,
});

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Busca a assinatura do usuário
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_URL}/#pricing` });
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('pagarme_subscription_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!subscription?.pagarme_subscription_id) {
    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_URL}/#pricing` });
  }

  // Pagar.me: busca dados da assinatura para pegar o link do portal
  // O portal de autoatendimento é acessado via link do dashboard Pagar.me
  // ou via link direto da assinatura
  try {
    const res = await fetch(
      `${PAGARME_API}/subscriptions/${subscription.pagarme_subscription_id}`,
      { headers: { ...auth(), 'Content-Type': 'application/json' } }
    );
    const data = await res.json();

    // Pagar.me não tem portal de self-service como o Stripe Customer Portal.
    // A melhor prática é redirecionar para o link de pagamento do próximo ciclo
    // ou para o e-mail de gerenciamento.
    const portalUrl =
      data.current_cycle?.payment_url ||
      `https://app.pagar.me/subscriptions/${subscription.pagarme_subscription_id}`;

    return NextResponse.json({ url: portalUrl });
  } catch {
    // Fallback: redireciona para contato/suporte
    return NextResponse.json({
      url: `mailto:suporte@infinitcode.netlify.app?subject=Gerenciar assinatura&body=ID: ${subscription.pagarme_subscription_id}`,
    });
  }
}
