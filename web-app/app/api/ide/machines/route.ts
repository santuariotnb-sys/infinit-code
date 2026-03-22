import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { createMachine, waitForMachine } from '@/lib/ide/fly-machines';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// GET — retorna a machine ativa do user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: machineSession } = await supabase
    .from('machine_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'running')
    .single();

  return NextResponse.json({ machine: machineSession || null });
}

// POST — cria uma nova machine
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Verifica se já tem machine rodando
  const { data: existing } = await supabase
    .from('machine_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'running')
    .single();

  if (existing) {
    return NextResponse.json({ machine: existing });
  }

  try {
    // Cria machine no Fly.io
    const machine = await createMachine(user.id);

    // Aguarda machine ficar pronta
    const ready = await waitForMachine(machine.id, 'started', 60000);

    // Salva no Supabase usando upsert para evitar race condition
    // (dois requests simultâneos poderiam criar machines duplicadas)
    const { data: machineSession, error } = await supabase
      .from('machine_sessions')
      .upsert(
        {
          user_id: user.id,
          fly_machine_id: machine.id,
          fly_region: ready.region,
          status: 'running',
          private_ip: ready.private_ip,
        },
        { onConflict: 'user_id,status' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ machine: machineSession });
  } catch (err: any) {
    console.error('Failed to create machine:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
