'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useIDEStore } from '@/lib/ide/store';
import { GitHubConnect } from './GitHubConnect';
import type { MachineSession } from '@/lib/ide/machine-client';

interface ToolbarProps {
  onToggleTerminal?: () => void;
  showTerminal?: boolean;
  onToggleChat?: () => void;
  showChat?: boolean;
  onToggleGit?: () => void;
  showGit?: boolean;
  onOpenRepos?: () => void;
  onOpenClaudeGuide?: () => void;
  machine?: MachineSession | null;
  onSyncFiles?: () => void;
  syncing?: boolean;
}

export function Toolbar({ onToggleTerminal, showTerminal, onToggleChat, showChat, onToggleGit, showGit, onOpenRepos, onOpenClaudeGuide, machine, onSyncFiles, syncing }: ToolbarProps) {
  const { data: session } = useSession();
  const { showPreview, showSnippets, showExplorer, togglePreview, toggleSnippets, toggleExplorer, projectName } = useIDEStore();
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    fetch('/api/ide/github/status')
      .then(r => r.json())
      .then(d => setGithubConnected(d.connected))
      .catch(() => {});
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      height: 42,
      background: '#0f1428',
      borderBottom: '1px solid #1c2340',
      fontFamily: 'monospace',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#00ff88', fontSize: 18, fontWeight: 700 }}>∞</span>
        <span style={{ color: '#e8e8e8', fontSize: 13, fontWeight: 700 }}>{projectName}</span>
      </div>

      <div style={{ flex: 1 }} />

      <ToggleBtn active={showExplorer} onClick={toggleExplorer} label="Arquivos" />
      <ToggleBtn active={showPreview} onClick={togglePreview} label="Preview" />
      {onToggleChat && (
        <ToggleBtn active={!!showChat} onClick={onToggleChat} label="∞ Chat" accent />
      )}
      {onToggleTerminal && (
        <ToggleBtn active={!!showTerminal} onClick={onToggleTerminal} label="Terminal" />
      )}
      <ToggleBtn active={showSnippets} onClick={toggleSnippets} label="Snippets" />
      {onToggleGit && (
        <ToggleBtn active={!!showGit} onClick={onToggleGit} label="Git" />
      )}

      {onSyncFiles && machine && (
        <button
          onClick={onSyncFiles}
          disabled={syncing}
          title="Sincronizar arquivos do container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: syncing ? '#0f1428' : '#1c2340',
            border: '1px solid #1c2340',
            borderRadius: 4,
            color: syncing ? '#5A6080' : '#3EEDB0',
            fontSize: 11,
            padding: '3px 10px',
            cursor: syncing ? 'default' : 'pointer',
            fontFamily: 'monospace',
          }}
        >
          {syncing ? '⟳ Syncing...' : '↻ Sync'}
        </button>
      )}

      <div style={{ width: 1, height: 20, background: '#1c2340', margin: '0 2px' }} />

      {githubConnected && onOpenRepos && (
        <button
          onClick={onOpenRepos}
          title="Clonar repositório"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#1c2340',
            border: '1px solid #1c2340',
            borderRadius: 4,
            color: '#AEB6D8',
            fontSize: 11,
            padding: '3px 10px',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z"/>
          </svg>
          Clone
        </button>
      )}

      <GitHubConnect />

      <div style={{ width: 1, height: 20, background: '#1c2340', margin: '0 2px' }} />

      <span style={{ fontSize: 11, color: '#5A6080' }}>{session?.user?.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        style={{
          background: 'none',
          border: '1px solid #222',
          borderRadius: 4,
          color: '#5A6080',
          fontSize: 11,
          padding: '3px 10px',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Sair
      </button>
    </div>
  );
}

function ToggleBtn({ active, onClick, label, accent }: { active: boolean; onClick: () => void; label: string; accent?: boolean }) {
  const activeColor = accent ? '#00ff88' : '#00ff88';
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? (accent ? 'rgba(0,255,136,.15)' : 'rgba(0,255,136,.1)') : 'transparent',
        border: `1px solid ${active ? 'rgba(0,255,136,.2)' : '#1c2340'}`,
        borderRadius: 4,
        color: active ? activeColor : '#5A6080',
        fontSize: 11,
        padding: '3px 10px',
        cursor: 'pointer',
        fontFamily: 'monospace',
        fontWeight: accent ? 700 : 400,
      }}
    >
      {label}
    </button>
  );
}
