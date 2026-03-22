import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ connected: false });
  }

  const token = req.cookies.get('github_token')?.value;
  return NextResponse.json({ connected: !!token });
}
