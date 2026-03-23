'use client';

import { useState, useEffect } from 'react';
import { fetchRepos, cloneRepo, type GitHubRepo } from '@/lib/ide/github-client';
import { getMachine, createMachine, type MachineSession } from '@/lib/ide/machine-client';

interface RepoSelectorProps {
  machine: MachineSession | null;
  onClone: (command: string, env?: Record<string, string>) => void;
  onClose: () => void;
  onStartTerminal?: () => void;
  onMachineReady?: (machine: MachineSession) => void;
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

export function RepoSelector({ machine: machineProp, onClone, onClose, onStartTerminal, onMachineReady }: RepoSelectorProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cloning, setCloning] = useState<string | null>(null);
  const [machine, setMachine] = useState<MachineSession | null>(machineProp);
  const [creatingMachine, setCreatingMachine] = useState(false);

  // Busca repos
  useEffect(() => {
    fetchRepos()
      .then(setRepos)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Se não tem machine do prop, busca da API
  useEffect(() => {
    if (machineProp) {
      setMachine(machineProp);
      return;
    }
    getMachine().then(m => {
      if (m) setMachine(m);
    }).catch(() => {});
  }, [machineProp]);

  const ensureMachine = async (): Promise<MachineSession | null> => {
    if (machine) return machine;

    setCreatingMachine(true);
    setError('');
    try {
      // Tenta buscar machine existente
      let m = await getMachine();
      if (!m) {
        m = await createMachine();
      }
      setMachine(m);
      onMachineReady?.(m);
      // Abre o terminal para a conexão WebSocket
      onStartTerminal?.();
      return m;
    } catch (err: any) {
      setError(`Erro ao criar ambiente: ${err.message}`);
      return null;
    } finally {
      setCreatingMachine(false);
    }
  };

  const handleClone = async (repo: GitHubRepo) => {
    setCloning(repo.fullName);
    setError('');

    try {
      // Garante que tem machine rodando
      const m = await ensureMachine();
      if (!m) {
        setCloning(null);
        return;
      }

      const { command, env } = await cloneRepo(repo.fullName, m.id);
      onClone(command, env);
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
          width: '95vw',
          maxWidth: 520,
          maxHeight: '80vh',
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
                cursor: cloning ? 'default' : 'pointer',
              }}
              onMouseEnter={e => { if (!cloning) e.currentTarget.style.background = '#131829'; }}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onClick={() => { if (!cloning) handleClone(repo); }}
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
                disabled={!!cloning}
                style={{
                  background: cloning === repo.fullName ? '#1c2340' : '#00ff88',
                  color: cloning === repo.fullName ? '#5A6080' : '#000',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: cloning ? 'default' : 'pointer',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                {cloning === repo.fullName
                  ? (creatingMachine ? 'Criando ambiente...' : 'Clonando...')
                  : 'Clone →'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
