'use client';

import { useState, useEffect } from 'react';
import { fetchRepos, cloneRepo, type GitHubRepo } from '@/lib/ide/github-client';
import type { MachineSession } from '@/lib/ide/machine-client';

interface RepoSelectorProps {
  machine: MachineSession | null;
  onClone: (command: string) => void;
  onClose: () => void;
}

const langColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
};

export function RepoSelector({ machine, onClone, onClose }: RepoSelectorProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cloning, setCloning] = useState<string | null>(null);

  useEffect(() => {
    fetchRepos()
      .then(setRepos)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleClone = async (repo: GitHubRepo) => {
    if (!machine) return;
    setCloning(repo.fullName);
    try {
      const { command } = await cloneRepo(repo.fullName, machine.id);
      onClone(command);
      onClose();
    } catch (err: any) {
      setError(err.message);
      setCloning(null);
    }
  };

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'monospace',
    }}
    onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0b0f1e',
          border: '1px solid #1c2340',
          borderRadius: 12,
          width: 520,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1c2340',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#AEB6D8">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e8e8e8' }}>Clonar repositório</span>
          </div>
          <span
            onClick={onClose}
            style={{ cursor: 'pointer', color: '#5A6080', fontSize: 18 }}
          >×</span>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar repositório..."
          autoFocus
          style={{
            background: '#0f1428',
            border: 'none',
            borderBottom: '1px solid #1c2340',
            padding: '10px 20px',
            color: '#e8e8e8',
            fontFamily: 'monospace',
            fontSize: 12,
            outline: 'none',
          }}
        />

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: '#5A6080', fontSize: 12 }}>
              Carregando repositórios...
            </div>
          )}

          {error && (
            <div style={{ padding: 20, textAlign: 'center', color: '#e74c3c', fontSize: 12 }}>
              {error}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#5A6080', fontSize: 12 }}>
              Nenhum repositório encontrado
            </div>
          )}

          {filtered.map(repo => (
            <div
              key={repo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 20px',
                gap: 12,
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#131829')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onClick={() => handleClone(repo)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#e8e8e8', fontWeight: 500 }}>{repo.name}</span>
                  {repo.private && (
                    <span style={{
                      fontSize: 9,
                      color: '#5A6080',
                      border: '1px solid #1c2340',
                      borderRadius: 3,
                      padding: '1px 4px',
                    }}>private</span>
                  )}
                </div>
                {repo.description && (
                  <div style={{ fontSize: 11, color: '#5A6080', marginTop: 2 }}>
                    {repo.description.slice(0, 80)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 10, color: '#5A6080' }}>
                  {repo.language && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: langColors[repo.language] || '#5A6080',
                      }} />
                      {repo.language}
                    </span>
                  )}
                  <span>{new Date(repo.updatedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <button
                disabled={cloning === repo.fullName}
                style={{
                  background: cloning === repo.fullName ? '#1c2340' : '#00ff88',
                  color: cloning === repo.fullName ? '#5A6080' : '#000',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: cloning === repo.fullName ? 'default' : 'pointer',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                {cloning === repo.fullName ? 'Clonando...' : 'Clone →'}
              </button>
            </div>
          ))}
        </div>

        {!machine && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #1c2340',
            fontSize: 11,
            color: '#e74c3c',
            textAlign: 'center',
          }}>
            Inicie o terminal primeiro para clonar um repositório
          </div>
        )}
      </div>
    </div>
  );
}
