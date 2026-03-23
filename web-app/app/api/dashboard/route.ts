// app/api/dashboard/route.ts
// Inclui githubConnected para unificar o estado no dashboard

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
    .select('id, github_connected, github_username')
    .eq('email', session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({
      license: null,
      subscription: null,
      githubConnected: false,
      githubUsername: null,
    });
  }

  const [{ data: license }, { data: subscription }] = await Promise.all([
    supabase
      .from('licenses')
      .select('key, plan, created_at')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('status, current_period_end, stripe_subscription_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
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
    } : null,
    githubConnected: user.github_connected ?? false,
    githubUsername: user.github_username ?? null,
  });
}
