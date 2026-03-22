// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ license: null, subscription: null });
  }

  const [{ data: license }, { data: subscription }] = await Promise.all([
    supabase
      .from('licenses')
      .select('key, plan, created_at')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('status, current_period_end, pagarme_subscription_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  return NextResponse.json({
    license: license ? {
      key: license.key,
      plan: license.plan,
      createdAt: license.created_at,
    } : null,
    subscription: subscription ? {
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      pagarmeSubscriptionId: subscription.pagarme_subscription_id,
    } : null,
  });
}
