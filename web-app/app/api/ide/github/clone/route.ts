import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// POST — envia comando de git clone para o container do user
// O clone real acontece via terminal WebSocket. Esta rota apenas:
// 1. Valida auth + GitHub token
// 2. Atualiza machine_sessions.github_repo
// 3. Retorna o comando git clone para o frontend executar no terminal
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const githubToken = req.cookies.get('github_token')?.value || (session as any).githubAccessToken;
  if (!githubToken) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 403 });
  }

  const { repo, machineSessionId } = await req.json();

  if (!repo || !machineSessionId) {
    return NextResponse.json({ error: 'repo and machineSessionId required' }, { status: 400 });
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

  // Verifica machine pertence ao user
  const { data: machineSession } = await supabase
    .from('machine_sessions')
    .select('*')
    .eq('id', machineSessionId)
    .eq('user_id', user.id)
    .eq('status', 'running')
    .single();

  if (!machineSession) {
    return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
  }

  // Atualiza github_repo na session
  await supabase
    .from('machine_sessions')
    .update({ github_repo: repo })
    .eq('id', machineSessionId);

  // Monta o comando git clone com token embutido (HTTPS auth)
  // O token é passado via URL para autenticar no clone de repos privados
  const cloneUrl = `https://${githubToken}@github.com/${repo}.git`;
  const repoName = repo.split('/').pop();
  const cloneCommand = `cd /home/coder/project && git clone ${cloneUrl} ${repoName} && cd ${repoName} && git config user.email "${session.user.email}" && git config user.name "${session.user.name || 'Infinit Code User'}" && echo "\\n✓ Repo clonado com sucesso!"`;

  return NextResponse.json({
    command: cloneCommand,
    repoName,
    repo,
  });
}
