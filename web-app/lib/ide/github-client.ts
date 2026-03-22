export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  url: string;
  description: string | null;
  language: string | null;
  updatedAt: string;
  defaultBranch: string;
}

export async function fetchRepos(page: number = 1): Promise<GitHubRepo[]> {
  const res = await fetch(`/api/ide/github/repos?page=${page}&sort=updated`);
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Failed to fetch repos');
  }
  const { repos } = await res.json();
  return repos;
}

export async function cloneRepo(
  repo: string,
  machineSessionId: string
): Promise<{ command: string; repoName: string }> {
  const res = await fetch('/api/ide/github/clone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo, machineSessionId }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Failed to clone');
  }
  return res.json();
}
