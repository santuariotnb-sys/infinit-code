import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub não configurado' }, { status: 500 });
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/ide/github/callback`;
  const scope = 'repo read:user user:email';
  const state = 'ide-connect';

  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  return NextResponse.redirect(githubUrl);
}
