// app/api/ide/github/callback/route.ts
// Persiste github_connected + github_username no Supabase
// para que dashboard e IDE vejam o mesmo estado

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
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/ide?github_error=no_code', req.url));
  }

  try {
    // 1. Troca code por access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token error:', tokenData.error);
      return NextResponse.redirect(new URL('/ide?github_error=token_failed', req.url));
    }

    // 2. Busca dados do usuário no GitHub
    const ghRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const ghUser = ghRes.ok ? await ghRes.json() : null;

    // 3. Persiste no Supabase — fonte de verdade
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (user) {
      await supabase
        .from('users')
        .update({
          github_connected: true,
          github_username: ghUser?.login ?? null,
        })
        .eq('id', user.id);
    }

    // 4. Salva token em cookie httpOnly (para chamadas da IDE)
    const response = NextResponse.redirect(new URL('/ide', req.url));
    response.cookies.set('github_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return response;
  } catch (err) {
    console.error('GitHub callback error:', err);
    return NextResponse.redirect(new URL('/ide?github_error=exchange_failed', req.url));
  }
}
