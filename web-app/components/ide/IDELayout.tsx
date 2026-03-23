'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
import { ChatPanel } from './ChatPanel';
import type { MachineSession } from '@/lib/ide/machine-client';
import { syncFromContainer, loadFileContent } from '@/lib/ide/file-client';

type MobileTab = 'chat' | 'editor' | 'terminal' | 'explorer' | 'preview';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export function IDELayout() {
  const { showPreview, showExplorer, showSnippets, setMachineConnected, syncFromContainer: storeSyncFromContainer } = useIDEStore();
  const [showTerminal, setShowTerminal] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showGit, setShowGit] = useState(false);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [showClaudeGuide, setShowClaudeGuide] = useState(false);
  const [terminalHeight] = useState(260);
  const [machine, setMachine] = useState<MachineSession | null>(null);
  const [terminalConnected, setTerminalConnected] = useState(false);
  const [autoConnect, setAutoConnect] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const terminalCommandRef = useRef<((cmd: string) => void) | null>(null);
  const pendingCommandsRef = useRef<{ command: string; env?: Record<string, string> } | null>(null);

  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat');

  const explorerWidth = showExplorer ? 220 : 0;

  // Auto-sync após clone: tenta sync com retry até encontrar arquivos
  const schedulePostCloneSync = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 6; // 6 tentativas × 5s = 30s total
    const trySync = async () => {
      attempts++;
      try {
        const files = await syncFromContainer();
        if (files.length > 0) {
          storeSyncFromContainer(files);
          return;
        }
      } catch {}
      if (attempts < maxAttempts) {
        setTimeout(trySync, 5000);
      }
    };
    setTimeout(trySync, 8000);
  }, [storeSyncFromContainer]);

  // Quando terminal conectar, executa comandos pendentes
  useEffect(() => {
    if (terminalConnected && pendingCommandsRef.current) {
      const { command, env } = pendingCommandsRef.current;
      pendingCommandsRef.current = null;

      const sendCmd = (cmd: string) => {
        if (terminalCommandRef.current) {
          terminalCommandRef.current(cmd);
        }
      };

      if (env) {
        const exportCmd = Object.entries(env)
          .map(([k, v]) => `export ${k}='${v.replace(/'/g, "'\\''")}'`)
          .join(' && ');
        sendCmd(exportCmd);
        setTimeout(() => sendCmd(command), 500);
      } else {
        sendCmd(command);
      }

      // Se era um clone command, agenda auto-sync
      if (command.includes('git clone')) {
        schedulePostCloneSync();
      }
    }
  }, [terminalConnected, schedulePostCloneSync]);

  const handleRunCommand = useCallback((command: string) => {
    if (terminalCommandRef.current) {
      terminalCommandRef.current(command);
    }
  }, []);

  const handleCloneCommand = useCallback((command: string, env?: Record<string, string>) => {
    if (terminalConnected && terminalCommandRef.current) {
      if (env) {
        const exportCmd = Object.entries(env)
          .map(([k, v]) => `export ${k}='${v.replace(/'/g, "'\\''")}'`)
          .join(' && ');
        terminalCommandRef.current(exportCmd);
        setTimeout(() => terminalCommandRef.current?.(command), 500);
      } else {
        terminalCommandRef.current(command);
      }
      // Auto-sync após clone
      schedulePostCloneSync();
      return;
    }

    pendingCommandsRef.current = { command, env };
    setAutoConnect(true);
    setShowTerminal(true);
    if (isMobile) setMobileTab('terminal');
  }, [terminalConnected, isMobile]);

  const handleStartTerminal = useCallback(() => {
    setAutoConnect(true);
    setShowTerminal(true);
    if (isMobile) setMobileTab('terminal');
  }, [isMobile]);

  const handleTerminalStatusChange = useCallback((connected: boolean) => {
    setTerminalConnected(connected);
    setMachineConnected(connected);
  }, [setMachineConnected]);

  // Sync files do container → Monaco
  const handleSyncFiles = useCallback(async () => {
    if (!terminalConnected) return;
    setSyncing(true);
    try {
      const files = await syncFromContainer();
      storeSyncFromContainer(files);
    } catch (err: any) {
      console.warn('[sync] Failed:', err.message);
    } finally {
      setSyncing(false);
    }
  }, [terminalConnected, storeSyncFromContainer]);

  // Mobile layout
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: '#0a0a0a',
        overflow: 'hidden',
      }}>
        {/* Mobile header compacto */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          height: 40,
          background: '#0f1428',
          borderBottom: '1px solid #1c2340',
          fontFamily: 'monospace',
          gap: 8,
          flexShrink: 0,
        }}>
          <span style={{ color: '#00ff88', fontSize: 16, fontWeight: 700 }}>∞</span>
          <span style={{ color: '#e8e8e8', fontSize: 12, fontWeight: 700, flex: 1 }}>Infinit Code</span>
          <button
            onClick={() => setShowRepoSelector(true)}
            style={{
              background: '#1c2340',
              border: 'none',
              borderRadius: 4,
              color: '#AEB6D8',
              fontSize: 10,
              padding: '4px 8px',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >Clone</button>
        </div>

        {/* Conteúdo principal — 1 painel por vez */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {mobileTab === 'chat' && (
            <ChatPanel
              machine={machine}
              onStartTerminal={handleStartTerminal}
              sendCommand={handleRunCommand}
              onOpenRepos={() => setShowRepoSelector(true)}
              onSyncFiles={handleSyncFiles}
            />
          )}
          {mobileTab === 'editor' && <EditorPanel />}
          {mobileTab === 'preview' && <PreviewPanel machine={machine} />}
          {mobileTab === 'explorer' && (
            <div style={{ height: '100%', overflow: 'auto' }}>
              <FileExplorer />
              {showGit && <GitPanel onRunCommand={handleRunCommand} />}
            </div>
          )}
          {mobileTab === 'terminal' && (
            <TerminalPanel
              onMachineChange={setMachine}
              onCommandRef={ref => { terminalCommandRef.current = ref; }}
              onStatusChange={handleTerminalStatusChange}
              autoConnect={autoConnect}
            />
          )}
        </div>

        {/* Bottom navigation */}
        <div style={{
          display: 'flex',
          background: '#0f1428',
          borderTop: '1px solid #1c2340',
          flexShrink: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          {([
            { id: 'chat' as MobileTab, label: '∞', title: 'Chat' },
            { id: 'editor' as MobileTab, label: '{ }', title: 'Editor' },
            { id: 'preview' as MobileTab, label: '▶', title: 'Preview' },
            { id: 'explorer' as MobileTab, label: '📁', title: 'Arquivos' },
            { id: 'terminal' as MobileTab, label: '>_', title: 'Terminal' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: mobileTab === tab.id ? '#00ff88' : '#5A6080',
                fontFamily: 'monospace',
                fontSize: 14,
                borderTop: mobileTab === tab.id ? '2px solid #00ff88' : '2px solid transparent',
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: 9 }}>{tab.title}</span>
            </button>
          ))}
        </div>

        {showRepoSelector && (
          <RepoSelector
            machine={machine}
            onClone={handleCloneCommand}
            onClose={() => setShowRepoSelector(false)}
            onStartTerminal={handleStartTerminal}
            onMachineReady={(m) => { setMachine(m); }}
          />
        )}
        {showClaudeGuide && (
          <ClaudeCodeGuide
            onClose={() => setShowClaudeGuide(false)}
            onRunCommand={(cmd) => {
              setShowTerminal(true);
              setAutoConnect(true);
              setMobileTab('terminal');
              pendingCommandsRef.current = { command: cmd };
            }}
          />
        )}
      </div>
    );
  }

  // Desktop layout (original)
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
        onToggleChat={() => setShowChat(!showChat)}
        showChat={showChat}
        onToggleGit={() => setShowGit(!showGit)}
        showGit={showGit}
        onOpenRepos={() => setShowRepoSelector(true)}
        onOpenClaudeGuide={() => setShowClaudeGuide(true)}
        machine={machine}
        onSyncFiles={handleSyncFiles}
        syncing={syncing}
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
                <PreviewPanel machine={machine} />
              </div>
            )}
          </div>
          {showTerminal && (
            <div style={{ height: terminalHeight, flexShrink: 0, overflow: 'hidden' }}>
              <TerminalPanel
                onMachineChange={setMachine}
                onCommandRef={ref => { terminalCommandRef.current = ref; }}
                onStatusChange={handleTerminalStatusChange}
                autoConnect={autoConnect}
              />
            </div>
          )}
        </div>

        {showChat && (
          <div style={{ width: 420, flexShrink: 0, overflow: 'hidden', borderLeft: '1px solid #1c2340' }}>
            <ChatPanel
              machine={machine}
              onStartTerminal={handleStartTerminal}
              sendCommand={handleRunCommand}
              onOpenRepos={() => setShowRepoSelector(true)}
              onSyncFiles={handleSyncFiles}
            />
          </div>
        )}
        {showSnippets && !showChat && (
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
          onStartTerminal={handleStartTerminal}
          onMachineReady={(m) => { setMachine(m); }}
        />
      )}

      {showClaudeGuide && (
        <ClaudeCodeGuide
          onClose={() => setShowClaudeGuide(false)}
          onRunCommand={(cmd) => {
            setShowTerminal(true);
            setAutoConnect(true);
            pendingCommandsRef.current = { command: cmd };
          }}
        />
      )}
    </div>
  );
}
