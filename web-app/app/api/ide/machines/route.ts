import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { createMachine, waitForMachine, getMachine as getFlyMachine } from '@/lib/ide/fly-machines';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// GET — retorna a machine ativa do user (verifica estado real no Fly.io)
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

  if (!machineSession) {
    return NextResponse.json({ machine: null });
  }

  // Verifica estado real no Fly.io — container pode ter morrido
  try {
    const flyMachine = await getFlyMachine(machineSession.fly_machine_id);
    if (flyMachine.state !== 'started' && flyMachine.state !== 'starting') {
      // Container morreu — limpa sessão stale
      await supabase
        .from('machine_sessions')
        .update({ status: 'stopped' })
        .eq('id', machineSession.id);
      return NextResponse.json({ machine: null });
    }
  } catch {
    // Machine não existe mais no Fly — limpa sessão
    await supabase
      .from('machine_sessions')
      .update({ status: 'stopped' })
      .eq('id', machineSession.id);
    return NextResponse.json({ machine: null });
  }

  return NextResponse.json({ machine: machineSession });
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
    // Verifica se a machine ainda está viva no Fly.io
    try {
      const flyMachine = await getFlyMachine(existing.fly_machine_id);
      if (flyMachine.state === 'started' || flyMachine.state === 'starting') {
        return NextResponse.json({ machine: existing });
      }
    } catch {}
    // Machine morta — limpa sessão stale
    await supabase
      .from('machine_sessions')
      .update({ status: 'stopped' })
      .eq('id', existing.id);
  }

  try {
    // Busca GitHub token do cookie para injetar no container
    const githubToken = req.cookies.get('github_token')?.value;

    // Cria machine no Fly.io
    const machine = await createMachine(user.id, { githubToken: githubToken || undefined });

    // Aguarda machine ficar pronta
    const ready = await waitForMachine(machine.id, 'started', 60000);

    // Salva no Supabase
    const { data: machineSession, error } = await supabase
      .from('machine_sessions')
      .insert({
        user_id: user.id,
        fly_machine_id: machine.id,
        fly_region: ready.region,
        status: 'running',
        private_ip: ready.private_ip,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ machine: machineSession });
  } catch (err: any) {
    console.error('Failed to create machine:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
