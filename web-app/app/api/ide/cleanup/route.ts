import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { destroyMachine } from '@/lib/ide/fly-machines';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Cron job — destroy machines com heartbeat > 24h
// Pode ser chamado via Netlify Scheduled Function ou cron externo
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: stale } = await supabase
    .from('machine_sessions')
    .select('*')
    .eq('status', 'running')
    .lt('last_heartbeat', cutoff);

  if (!stale || stale.length === 0) {
    return NextResponse.json({ cleaned: 0 });
  }

  let cleaned = 0;
  for (const session of stale) {
    try {
      await destroyMachine(session.fly_machine_id);
      await supabase
        .from('machine_sessions')
        .update({ status: 'destroyed' })
        .eq('id', session.id);
      cleaned++;
    } catch (err: any) {
      console.error(`Failed to cleanup machine ${session.fly_machine_id}:`, err.message);
    }
  }

  return NextResponse.json({ cleaned, total: stale.length });
}
