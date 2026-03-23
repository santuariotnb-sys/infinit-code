import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const FLY_APP_NAME = process.env.FLY_APP_NAME || 'infinitcode-machines';

// ── Proxy reverso para o dev server do container (porta 3000) ──

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

async function proxyToContainer(req: NextRequest, machineId: string, path: string): Promise<Response> {
  // Fly.io Anycast: porta 3000 com TLS handler definido nos services
  // fly-force-instance-id funciona na internet pública para rotear à machine correta
  const url = `https://${FLY_APP_NAME}.fly.dev:3000${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      method: req.method,
      headers: {
        'fly-force-instance-id': machineId,
      },
      redirect: 'manual',
      signal: controller.signal,
    });

    const headers = new Headers();
    const contentType = res.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    // Cacheia por pouco tempo para evitar spam de requests
    headers.set('Cache-Control', 'no-cache');

    return new Response(res.body, {
      status: res.status,
      headers,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const machine = await getUserMachine(session.user.email);
  if (!machine) {
    return new Response(
      `<!DOCTYPE html>
      <html><body style="background:#0a0a0a;color:#5A6080;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
        <div style="text-align:center">
          <p style="font-size:32px">🖥️</p>
          <p>Nenhum container ativo</p>
          <p style="font-size:11px;color:#3a4060">Inicie o terminal para ativar o preview</p>
        </div>
      </body></html>`,
      { status: 200, headers: { 'content-type': 'text/html' } }
    );
  }

  // Extrai path da query string (ou usa /)
  const previewPath = req.nextUrl.searchParams.get('path') || '/';

  try {
    return await proxyToContainer(req, machine.fly_machine_id, previewPath);
  } catch {
    return new Response(
      `<!DOCTYPE html>
      <html><body style="background:#0a0a0a;color:#5A6080;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
        <div style="text-align:center">
          <p style="font-size:32px">⏳</p>
          <p>Dev server não está rodando</p>
          <p style="font-size:11px;color:#3a4060">Execute <code style="color:#00ff88">npm run dev</code> no terminal</p>
        </div>
      </body></html>`,
      { status: 200, headers: { 'content-type': 'text/html' } }
    );
  }
}
