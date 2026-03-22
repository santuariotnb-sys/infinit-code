import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  default_branch: string;
}

// GET — lista repos do user no GitHub
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const githubToken = req.cookies.get('github_token')?.value || (session as any).githubAccessToken;
  if (!githubToken) {
    return NextResponse.json({ error: 'GitHub not connected', connected: false }, { status: 403 });
  }

  const url = new URL(req.url);
  const page = url.searchParams.get('page') || '1';
  const sort = url.searchParams.get('sort') || 'updated';

  try {
    const res = await fetch(
      `https://api.github.com/user/repos?sort=${sort}&per_page=30&page=${page}&affiliation=owner`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `GitHub API error: ${res.status}` }, { status: res.status });
    }

    const repos: GitHubRepo[] = await res.json();

    return NextResponse.json({
      repos: repos.map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        private: r.private,
        url: r.html_url,
        description: r.description,
        language: r.language,
        updatedAt: r.updated_at,
        defaultBranch: r.default_branch,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
