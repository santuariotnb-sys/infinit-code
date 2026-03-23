import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const FLY_APP_NAME = process.env.FLY_APP_NAME || 'infinitcode-machines';
const IDE_JWT_SECRET = process.env.IDE_JWT_SECRET!;

// ── Helper: resolve machine session do user ─────────────────
async function getUserMachine(email: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!user) return null;

  const { data: machineSession } = await supabase
    .from('machine_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'running')
    .single();

  return machineSession;
}

// ── Helper: proxy para file server do container ─────────────
async function containerFetch(machineId: string, path: string, options: RequestInit = {}): Promise<Response> {
  const url = `https://${FLY_APP_NAME}.fly.dev:9090${path}`;
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${IDE_JWT_SECRET}`,
      'Content-Type': 'application/json',
      'fly-force-instance-id': machineId,
      ...options.headers,
    },
  });
}

// GET — tree ou read
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const machine = await getUserMachine(session.user.email);
  if (!machine) {
    return NextResponse.json({ error: 'No running machine' }, { status: 404 });
  }

  const action = req.nextUrl.searchParams.get('action');
  const filePath = req.nextUrl.searchParams.get('path');

  if (action === 'tree') {
    const res = await containerFetch(machine.fly_machine_id, '/tree');
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  if (action === 'read' && filePath) {
    const res = await containerFetch(machine.fly_machine_id, `/read?path=${encodeURIComponent(filePath)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// POST — write, mkdir, rename
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const machine = await getUserMachine(session.user.email);
  if (!machine) {
    return NextResponse.json({ error: 'No running machine' }, { status: 404 });
  }

  const action = req.nextUrl.searchParams.get('action');
  const body = await req.json();

  if (action === 'write') {
    const res = await containerFetch(machine.fly_machine_id, '/write', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  if (action === 'mkdir') {
    const res = await containerFetch(machine.fly_machine_id, '/mkdir', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  if (action === 'rename') {
    const res = await containerFetch(machine.fly_machine_id, '/rename', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// DELETE — delete file/folder
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const machine = await getUserMachine(session.user.email);
  if (!machine) {
    return NextResponse.json({ error: 'No running machine' }, { status: 404 });
  }

  const filePath = req.nextUrl.searchParams.get('path');
  if (!filePath) {
    return NextResponse.json({ error: 'path required' }, { status: 400 });
  }

  const res = await containerFetch(machine.fly_machine_id, `/delete?path=${encodeURIComponent(filePath)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
