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
      padding: '0 16px',
      height: 44,
      background: '#0c0c1d',
      borderBottom: '1px solid rgba(124, 92, 252, 0.12)',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      gap: 6,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16 }}>
        <div style={{
          width: 26, height: 26,
          borderRadius: 6,
          background: '#7c5cfc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#fff',
          boxShadow: '0 0 12px rgba(124, 92, 252, 0.3)',
        }}>∞</div>
        <span style={{ color: '#e2e4f0', fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>{projectName}</span>
      </div>

      {/* Left group: Panels */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <ToolBtn active={showExplorer} onClick={toggleExplorer} icon="☰" label="Arquivos" />
        <ToolBtn active={showPreview} onClick={togglePreview} icon="▶" label="Preview" />
        {onToggleTerminal && (
          <ToolBtn active={!!showTerminal} onClick={onToggleTerminal} icon=">_" label="Terminal" />
        )}
      </div>

      <Divider />

      {/* Center group: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {onToggleGit && (
          <ToolBtn active={!!showGit} onClick={onToggleGit} icon="⑂" label="Git" />
        )}
        {onSyncFiles && machine && (
          <button
            onClick={onSyncFiles}
            disabled={syncing}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: syncing ? 'transparent' : 'rgba(62, 237, 176, 0.06)',
              border: '1px solid rgba(62, 237, 176, 0.12)',
              borderRadius: 6,
              color: syncing ? '#6e7191' : '#3EEDB0',
              fontSize: 11, fontWeight: 500,
              padding: '4px 10px',
              cursor: syncing ? 'default' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {syncing ? '↻ Syncing...' : '↻ Sync'}
          </button>
        )}
        {githubConnected && onOpenRepos && (
          <button
            onClick={onOpenRepos}
            title="Clonar repositório"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(124, 92, 252, 0.06)',
              border: '1px solid rgba(124, 92, 252, 0.12)',
              borderRadius: 6,
              color: '#a78bfa',
              fontSize: 11, fontWeight: 500,
              padding: '4px 10px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z"/>
            </svg>
            Clone
          </button>
        )}
        <GitHubConnect />
      </div>

      <div style={{ flex: 1 }} />

      {/* Right group: Chat + Snippets + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <ToolBtn active={showSnippets} onClick={toggleSnippets} icon="◇" label="Snippets" />
        {onToggleChat && (
          <ChatBtn active={!!showChat} onClick={onToggleChat} />
        )}
      </div>

      <Divider />

      <span style={{ fontSize: 11, color: '#6e7191', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session?.user?.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        style={{
          background: 'none',
          border: '1px solid rgba(124, 92, 252, 0.12)',
          borderRadius: 6,
          color: '#6e7191',
          fontSize: 11,
          padding: '4px 10px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
      >
        Sair
      </button>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: 'rgba(124, 92, 252, 0.1)', margin: '0 6px' }} />;
}

function ToolBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: active ? 'rgba(124, 92, 252, 0.1)' : 'transparent',
        border: `1px solid ${active ? 'rgba(124, 92, 252, 0.2)' : 'transparent'}`,
        borderRadius: 6,
        color: active ? '#a78bfa' : '#6e7191',
        fontSize: 11, fontWeight: 500,
        padding: '4px 10px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: 12, fontFamily: 'monospace', lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  );
}

function ChatBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Claude Code Chat"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: active
          ? 'linear-gradient(135deg, rgba(124, 92, 252, 0.15), rgba(62, 237, 176, 0.08))'
          : 'transparent',
        border: `1px solid ${active ? 'rgba(124, 92, 252, 0.25)' : 'transparent'}`,
        borderRadius: 6,
        color: active ? '#a78bfa' : '#6e7191',
        fontSize: 11, fontWeight: 600,
        padding: '4px 12px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
        boxShadow: active ? '0 0 12px rgba(124, 92, 252, 0.1)' : 'none',
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>∞</span>
      Chat
    </button>
  );
}
