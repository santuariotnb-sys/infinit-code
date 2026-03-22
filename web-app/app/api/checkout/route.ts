// app/api/checkout/route.ts
// Cria uma ordem de assinatura no Pagar.me e retorna a URL de pagamento
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const PAGARME_API = 'https://api.pagar.me/core/v5';
const PAGARME_KEY = process.env.PAGARME_SECRET_KEY!; // sk_live_xxx ou sk_test_xxx

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { plan = 'monthly' } = await req.json();

  // IDs dos planos criados no dashboard Pagar.me
  const planId = plan === 'annual'
    ? process.env.PAGARME_PLAN_ANNUAL!   // plano anual
    : process.env.PAGARME_PLAN_MONTHLY!; // plano mensal R$67

  try {
    // 1. Garante que o customer existe no Pagar.me
    const customer = await getOrCreateCustomer(session.user.email, session.user.name);

    // 2. Cria a subscription (Pagar.me retorna link de pagamento)
    const res = await fetch(`${PAGARME_API}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(PAGARME_KEY + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        customer,
        payment_method: 'credit_card',
        // URL de retorno após o pagamento
        metadata: {
          user_email: session.user.email,
          product: 'infinit-code-pro',
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[checkout/pagarme]', data);
      return NextResponse.json({ error: data.message || 'Erro no Pagar.me' }, { status: 400 });
    }

    // Retorna a URL de checkout do Pagar.me
    return NextResponse.json({
      url: data.current_cycle?.payment_url
        || `${process.env.NEXT_PUBLIC_URL}/dashboard?pending=1`,
      subscription_id: data.id,
    });

  } catch (err) {
    console.error('[checkout]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

async function getOrCreateCustomer(email: string, name?: string | null) {
  // Busca cliente existente
  const search = await fetch(
    `${PAGARME_API}/customers?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Basic ${Buffer.from(PAGARME_KEY + ':').toString('base64')}` } }
  );
  const result = await search.json();
  if (result.data?.length > 0) {
    return { id: result.data[0].id };
  }

  // Cria novo cliente
  return {
    email,
    name: name || email.split('@')[0],
    type: 'individual',
    country: 'BR',
  };
}
