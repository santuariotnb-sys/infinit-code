import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function generateLicenseKey(): string {
  const seg = () => Math.random().toString(36).substring(2,6).toUpperCase();
  return `INFT-${seg()}-${seg()}-${seg()}-${seg()}`;
}

async function sendLicenseEmail(email: string, key: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({
    from: 'Infinit Code <noreply@infinit-code.netlify.app>',
    to: email,
    subject: '∞ Sua chave Infinit Code Pro',
    html: `<p>Sua chave: <strong>${key}</strong></p><p>Ative em: VS Code → Ctrl+Shift+P → Infinit: Activate License Key</p>`,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-hub-signature') || '';
  const expected = 'sha1=' + createHmac('sha1', process.env.PAGARME_WEBHOOK_SECRET || 'secret').update(body).digest('hex');
  if (signature && signature !== expected) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }
  const event = JSON.parse(body);
  if (event.type === 'subscription.paid') {
    const email: string = event.data?.customer?.email;
    if (!email) return NextResponse.json({ received: true });
    const { data: user } = await supabase.from('users').upsert({ email }, { onConflict: 'email' }).select().single();
    const { data: existing } = await supabase.from('licenses').select('key').eq('user_id', user.id).single();
    if (!existing) {
      const key = generateLicenseKey();
      await supabase.from('subscriptions').upsert({ user_id: user.id, pagarme_subscription_id: event.data.id, status: 'active', plan: 'pro' }, { onConflict: 'pagarme_subscription_id' });
      const { data: sub } = await supabase.from('subscriptions').select('id').eq('user_id', user.id).single();
      await supabase.from('licenses').insert({ user_id: user.id, subscription_id: sub?.id, key, plan: 'pro' });
      await sendLicenseEmail(email, key);
    }
  }
  return NextResponse.json({ received: true });
}
