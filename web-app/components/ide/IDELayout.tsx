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
import { IntelliChat } from './IntelliChat';
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
  const { showPreview, showExplorer, showSnippets, setMachineConnected, syncFromContainer: storeSyncFromContainer, openFiles, activeFileId } = useIDEStore();
  const [showTerminal, setShowTerminal] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showGit, setShowGit] = useState(false);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [showClaudeGuide, setShowClaudeGuide] = useState(false);
  const [terminalHeight] = useState(240);
  const [terminalCollapsed, setTerminalCollapsed] = useState(true);
  const [machine, setMachine] = useState<MachineSession | null>(null);
  const [terminalConnected, setTerminalConnected] = useState(false);
  const [autoConnect, setAutoConnect] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const terminalCommandRef = useRef<((cmd: string) => void) | null>(null);
  const pendingCommandsRef = useRef<{ command: string; env?: Record<string, string> } | null>(null);

  // Terminal output state for IntelliChat
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const outputSubscribersRef = useRef<Set<(line: string) => void>>(new Set());

  const handleOutputLine = useCallback((line: string) => {
    setTerminalLines(prev => {
      const next = [...prev, line];
      return next.length > 100 ? next.slice(-100) : next;
    });
    outputSubscribersRef.current.forEach(cb => cb(line));
  }, []);

  const handleOutputSubscribe = useCallback((cb: (line: string) => void) => {
    outputSubscribersRef.current.add(cb);
    return () => { outputSubscribersRef.current.delete(cb); };
  }, []);

  const activeFile = openFiles.find(f => f.id === activeFileId) ?? null;

  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat');

  const explorerWidth = showExplorer ? 220 : 0;

  // Auto-sync após clone
  const schedulePostCloneSync = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 6;
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
      schedulePostCloneSync();
      return;
    }

    pendingCommandsRef.current = { command, env };
    setAutoConnect(true);
    setShowTerminal(true);
    setTerminalCollapsed(false);
    if (isMobile) setMobileTab('terminal');
  }, [terminalConnected, isMobile]);

  const handleStartTerminal = useCallback(() => {
    setAutoConnect(true);
    setShowTerminal(true);
    setTerminalCollapsed(false);
    if (isMobile) setMobileTab('terminal');
  }, [isMobile]);

  const handleTerminalStatusChange = useCallback((connected: boolean) => {
    setTerminalConnected(connected);
    setMachineConnected(connected);
  }, [setMachineConnected]);

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

  const terminalSendCommand = useCallback((cmd: string) => {
    if (terminalCommandRef.current) {
      terminalCommandRef.current(cmd);
    } else {
      setAutoConnect(true);
      setShowTerminal(true);
      setTerminalCollapsed(false);
      pendingCommandsRef.current = { command: cmd };
    }
  }, []);

  const handleToggleTerminal = useCallback(() => {
    if (!showTerminal) {
      setShowTerminal(true);
      setTerminalCollapsed(false);
    } else if (terminalCollapsed) {
      setTerminalCollapsed(false);
    } else {
      setTerminalCollapsed(true);
    }
  }, [showTerminal, terminalCollapsed]);

  // Mobile layout
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: '#06060f',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          height: 44,
          background: '#0c0c1d',
          borderBottom: '1px solid rgba(124, 92, 252, 0.12)',
          fontFamily: "'Space Grotesk', sans-serif",
          gap: 8,
          flexShrink: 0,
        }}>
          <div style={{
            width: 24, height: 24,
            borderRadius: 5,
            background: '#7c5cfc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#fff',
          }}>∞</div>
          <span style={{ color: '#e2e4f0', fontSize: 12, fontWeight: 700, flex: 1 }}>Infinit Code</span>
          <button
            onClick={() => setShowRepoSelector(true)}
            style={{
              background: 'rgba(124, 92, 252, 0.08)',
              border: '1px solid rgba(124, 92, 252, 0.12)',
              borderRadius: 6,
              color: '#a78bfa',
              fontSize: 10,
              padding: '4px 10px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >Clone</button>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {mobileTab === 'chat' && (
            <IntelliChat
              terminalSendCommand={terminalSendCommand}
              terminalOutput={terminalLines.join('\n')}
              onOutputSubscribe={handleOutputSubscribe}
              activeFile={activeFile}
              machine={machine}
            />
          )}
          {mobileTab === 'editor' && <EditorPanel />}
          {mobileTab === 'preview' && <PreviewPanel machine={machine} sendCommand={terminalSendCommand} />}
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
              onOutputLine={handleOutputLine}
              autoConnect={autoConnect}
            />
          )}
        </div>

        <div style={{
          display: 'flex',
          background: '#0c0c1d',
          borderTop: '1px solid rgba(124, 92, 252, 0.12)',
          flexShrink: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          {([
            { id: 'chat' as MobileTab, label: '∞', title: 'Chat' },
            { id: 'editor' as MobileTab, label: '{ }', title: 'Editor' },
            { id: 'preview' as MobileTab, label: '▶', title: 'Preview' },
            { id: 'explorer' as MobileTab, label: '☰', title: 'Arquivos' },
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
                color: mobileTab === tab.id ? '#a78bfa' : '#4a4f6e',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                borderTop: mobileTab === tab.id ? '2px solid #7c5cfc' : '2px solid transparent',
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
              setTerminalCollapsed(false);
              setAutoConnect(true);
              setMobileTab('terminal');
              pendingCommandsRef.current = { command: cmd };
            }}
          />
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#06060f',
      overflow: 'hidden',
    }}>
      <Toolbar
        onToggleTerminal={handleToggleTerminal}
        showTerminal={showTerminal && !terminalCollapsed}
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
          <div style={{
            width: explorerWidth,
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(124, 92, 252, 0.08)',
          }}>
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
                <PreviewPanel machine={machine} sendCommand={terminalSendCommand} />
              </div>
            )}
          </div>

          {/* Terminal: collapsible bar + panel */}
          {showTerminal && (
            <>
              {/* Terminal header bar (always visible when terminal is active) */}
              <div
                onClick={() => setTerminalCollapsed(!terminalCollapsed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 14px',
                  height: 30,
                  background: '#0c0c1d',
                  borderTop: '1px solid rgba(124, 92, 252, 0.08)',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 11,
                  color: '#6e7191',
                  gap: 8,
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                <span style={{
                  fontSize: 8,
                  transform: terminalCollapsed ? 'rotate(-90deg)' : 'rotate(0)',
                  transition: 'transform 0.15s',
                  display: 'inline-block',
                }}>▼</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: terminalConnected ? '#3EEDB0' : '#6e7191',
                    boxShadow: terminalConnected ? '0 0 6px rgba(62, 237, 176, 0.4)' : 'none',
                  }} />
                  TERMINAL
                  {terminalConnected && <span style={{ color: '#4a4f6e', fontSize: 10 }}>· gru</span>}
                </span>
                <div style={{ flex: 1 }} />
                {terminalConnected && (
                  <span style={{ fontSize: 10, color: '#4a4f6e' }}>Conectado</span>
                )}
              </div>
              {/* Terminal content */}
              {!terminalCollapsed && (
                <div style={{ height: terminalHeight, flexShrink: 0, overflow: 'hidden' }}>
                  <TerminalPanel
                    onMachineChange={setMachine}
                    onCommandRef={ref => { terminalCommandRef.current = ref; }}
                    onStatusChange={handleTerminalStatusChange}
                    onOutputLine={handleOutputLine}
                    autoConnect={autoConnect}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat panel - wider */}
        {showChat && (
          <div style={{
            width: 400,
            flexShrink: 0,
            overflow: 'hidden',
            borderLeft: '1px solid rgba(124, 92, 252, 0.08)',
          }}>
            <IntelliChat
              terminalSendCommand={terminalSendCommand}
              terminalOutput={terminalLines.join('\n')}
              onOutputSubscribe={handleOutputSubscribe}
              activeFile={activeFile}
              machine={machine}
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
            setTerminalCollapsed(false);
            setAutoConnect(true);
            pendingCommandsRef.current = { command: cmd };
          }}
        />
      )}
    </div>
  );
}
