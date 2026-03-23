// app/api/ide/github/status/route.ts
// Fonte de verdade unificada para GitHub conectado
// Consulta Supabase — funciona tanto na IDE quanto no Dashboard

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ connected: false });
  }

  // 1. Verifica no Supabase (fonte de verdade permanente)
  const { data: user } = await supabase
    .from('users')
    .select('id, github_connected, github_username')
    .eq('email', session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ connected: false });
  }

  // 2. Fallback: cookie ainda válido mas Supabase não atualizado
  //    (migração de usuários antigos)
  const cookieToken = req.cookies.get('github_token')?.value;
  const connectedViaCookie = !!cookieToken;

  // Se tem cookie mas Supabase não está atualizado, sincroniza
  if (connectedViaCookie && !user.github_connected) {
    try {
      const ghRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${cookieToken}` },
      });
      if (ghRes.ok) {
        const ghUser = await ghRes.json();
        await supabase
          .from('users')
          .update({
            github_connected: true,
            github_username: ghUser.login,
          })
          .eq('id', user.id);

        return NextResponse.json({
          connected: true,
          username: ghUser.login,
          avatar: ghUser.avatar_url,
        });
      }
    } catch {
      // Cookie inválido — ignora
    }
  }

  return NextResponse.json({
    connected: user.github_connected ?? false,
    username: user.github_username ?? null,
    avatar: null,
  });
}

// DELETE — desconecta GitHub (limpa Supabase + cookie)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (user) {
    await supabase
      .from('users')
      .update({ github_connected: false, github_username: null })
      .eq('id', user.id);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete('github_token');
  return response;
}
