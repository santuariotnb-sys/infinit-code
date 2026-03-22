import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/ide?github_error=no_code', req.url));
  }

  try {
    // Troca code por access token
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
      return NextResponse.redirect(new URL('/ide?github_error=token_failed', req.url));
    }

    // Salva token em cookie httpOnly
    const response = NextResponse.redirect(new URL('/ide', req.url));
    response.cookies.set('github_token', tokenData.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL('/ide?github_error=exchange_failed', req.url));
  }
}
