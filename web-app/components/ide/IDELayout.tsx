'use client';

import { useState, useCallback, useRef } from 'react';
import { useIDEStore } from '@/lib/ide/store';
import { Toolbar } from './Toolbar';
import { FileExplorer } from './FileExplorer';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel } from './PreviewPanel';
import { SnippetsPanel } from './SnippetsPanel';
import { TerminalPanel } from './TerminalPanel';
import { GitPanel } from './GitPanel';
import { RepoSelector } from './RepoSelector';
import { ClaudeCodeGuide } from './ClaudeCodeGuide';
import type { MachineSession } from '@/lib/ide/machine-client';

export function IDELayout() {
  const { showPreview, showExplorer, showSnippets } = useIDEStore();
  const [showTerminal, setShowTerminal] = useState(false);
  const [showGit, setShowGit] = useState(false);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [showClaudeGuide, setShowClaudeGuide] = useState(false);
  const [terminalHeight] = useState(260);
  const [machine, setMachine] = useState<MachineSession | null>(null);
  const terminalCommandRef = useRef<((cmd: string) => void) | null>(null);

  const explorerWidth = showExplorer ? 220 : 0;

  const handleRunCommand = useCallback((command: string) => {
    // Envia comando para o terminal via WebSocket
    if (terminalCommandRef.current) {
      terminalCommandRef.current(command);
    }
  }, []);

  const handleCloneCommand = useCallback((command: string) => {
    // Abre o terminal se não estiver aberto, depois executa o clone
    setShowTerminal(true);
    setTimeout(() => handleRunCommand(command), 500);
  }, [handleRunCommand]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0a0a0a',
      overflow: 'hidden',
    }}>
      <Toolbar
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        showTerminal={showTerminal}
        onToggleGit={() => setShowGit(!showGit)}
        showGit={showGit}
        onOpenRepos={() => setShowRepoSelector(true)}
        onOpenClaudeGuide={() => setShowClaudeGuide(true)}
        machine={machine}
      />
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {showExplorer && (
          <div style={{ width: explorerWidth, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <FileExplorer />
            {showGit && <GitPanel onRunCommand={handleRunCommand} />}
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <EditorPanel />
            </div>
            {showPreview && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <PreviewPanel />
              </div>
            )}
          </div>
          {showTerminal && (
            <div style={{ height: terminalHeight, flexShrink: 0, overflow: 'hidden' }}>
              <TerminalPanel
                onMachineChange={setMachine}
                onCommandRef={ref => { terminalCommandRef.current = ref; }}
              />
            </div>
          )}
        </div>
        {showSnippets && (
          <div style={{ width: 320, flexShrink: 0, overflow: 'hidden' }}>
            <SnippetsPanel />
          </div>
        )}
      </div>

      {showRepoSelector && (
        <RepoSelector
          machine={machine}
          onClone={handleCloneCommand}
          onClose={() => setShowRepoSelector(false)}
        />
      )}

      {showClaudeGuide && (
        <ClaudeCodeGuide
          onClose={() => setShowClaudeGuide(false)}
          onRunCommand={(cmd) => {
            setShowTerminal(true);
            setTimeout(() => handleRunCommand(cmd), 500);
          }}
        />
      )}
    </div>
  );
}
