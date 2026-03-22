import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Simple JWT implementation without external dependency on the API side
// We use a HMAC-based token
function createToken(payload: Record<string, any>, secret: string, expiresInSec: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = btoa(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSec }));
  const data = `${header}.${body}`;
  // Use Web Crypto for HMAC
  // For simplicity in Next.js API route, we'll use a basic approach
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { machineSessionId } = await req.json();

  if (!machineSessionId) {
    return NextResponse.json({ error: 'machineSessionId required' }, { status: 400 });
  }

  // Busca user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Busca machine session e verifica que pertence ao user
  const { data: machineSession } = await supabase
    .from('machine_sessions')
    .select('*')
    .eq('id', machineSessionId)
    .eq('user_id', user.id)
    .eq('status', 'running')
    .single();

  if (!machineSession) {
    return NextResponse.json({ error: 'Machine not found or not running' }, { status: 404 });
  }

  const secret = process.env.IDE_JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'JWT secret not configured' }, { status: 500 });
  }

  const token = createToken(
    {
      userId: user.id,
      machineId: machineSession.fly_machine_id,
      machineIp: machineSession.private_ip,
    },
    secret,
    60 // 60 seconds expiry
  );

  return NextResponse.json({
    token,
    wsUrl: `${process.env.FLY_WS_PROXY_URL}?token=${token}&machine=${machineSession.private_ip}`,
  });
}
