import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { destroyMachine, stopMachine } from '@/lib/ide/fly-machines';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// PATCH — heartbeat (atualiza last_heartbeat)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { machineId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Lookup user and verify ownership
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('machine_sessions')
    .update({ last_heartbeat: new Date().toISOString() })
    .eq('id', params.machineId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE — destrói a machine
export async function DELETE(
  req: NextRequest,
  { params }: { params: { machineId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Lookup user and verify ownership
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
    .eq('id', params.machineId)
    .eq('user_id', user.id)
    .single();

  if (!machineSession) {
    return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
  }

  try {
    await destroyMachine(machineSession.fly_machine_id);
  } catch (err: any) {
    console.error('Failed to destroy Fly machine:', err.message);
  }

  await supabase
    .from('machine_sessions')
    .update({ status: 'destroyed' })
    .eq('id', params.machineId);

  return NextResponse.json({ ok: true });
}
