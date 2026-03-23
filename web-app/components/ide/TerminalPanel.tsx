'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { MachineSession } from '@/lib/ide/machine-client';
import {
  getMachine,
  createMachine,
  destroyMachine,
  heartbeat,
  getWsToken,
} from '@/lib/ide/machine-client';

interface TerminalPanelProps {
  onMachineChange?: (machine: MachineSession | null) => void;
  onCommandRef?: (sendCommand: (cmd: string) => void) => void;
  onStatusChange?: (connected: boolean) => void;
  onOutputLine?: (line: string) => void;
  autoConnect?: boolean;
}

export function TerminalPanel({ onMachineChange, onCommandRef, onStatusChange, onOutputLine, autoConnect }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const termRef = useRef<any>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>();
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const [machine, setMachine] = useState<MachineSession | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting' | 'connected' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [authBanner, setAuthBanner] = useState<string | null>(null);

  // Expõe função para enviar comandos externamente (usado pelo GitPanel e RepoSelector)
  useEffect(() => {
    if (onCommandRef) {
      onCommandRef((cmd: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'input', data: cmd + '\r' }));
        }
      });
    }
  }, [onCommandRef, status]);

  const connect = useCallback(async () => {
    setStatus('starting');
    setErrorMsg('');

    // Limpa estado anterior
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (termRef.current) { termRef.current.dispose(); termRef.current = null; }
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = undefined; }
    if (resizeCleanupRef.current) { resizeCleanupRef.current(); resizeCleanupRef.current = null; }
    setMachine(null);
    onMachineChange?.(null);

    try {
      // Busca ou cria machine (API verifica estado real no Fly.io)
      let m = await getMachine();
      if (!m) {
        m = await createMachine();
      }
      setMachine(m);
      onMachineChange?.(m);

      // Pega token WS
      const { wsUrl } = await getWsToken(m.id);

      // Importa xterm dinamicamente (client-only)
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      const { WebLinksAddon } = await import('@xterm/addon-web-links');

      // Injeta CSS do xterm via style tag (evita problemas com PostCSS)
      if (!document.getElementById('xterm-css')) {
        const style = document.createElement('style');
        style.id = 'xterm-css';
        style.textContent = `.xterm{position:relative;user-select:none;-ms-user-select:none;-webkit-user-select:none}.xterm.focus,.xterm:focus{outline:none}.xterm .xterm-helpers{position:absolute;top:0;z-index:5}.xterm .xterm-helper-textarea{padding:0;border:0;margin:0;position:absolute;opacity:0;left:-9999em;top:0;width:0;height:0;z-index:-5;white-space:nowrap;overflow:hidden;resize:none}.xterm .composition-view{background:#000;color:#FFF;display:none;position:absolute;white-space:nowrap;z-index:1}.xterm .composition-view.active{display:block}.xterm .xterm-viewport{background-color:#000;overflow-y:scroll;cursor:default;position:absolute;right:0;left:0;top:0;bottom:0}.xterm .xterm-screen{position:relative}.xterm .xterm-screen canvas{position:absolute;left:0;top:0}.xterm .xterm-scroll-area{visibility:hidden}.xterm-char-measure-element{display:inline-block;visibility:hidden;position:absolute;top:0;left:-9999em;line-height:normal}.xterm.enable-mouse-events{cursor:default}.xterm.xterm-cursor-pointer,.xterm .xterm-cursor-pointer{cursor:pointer}.xterm.column-select.focus{cursor:crosshair}.xterm .xterm-accessibility,.xterm .xterm-message{position:absolute;left:0;top:0;bottom:0;right:0;z-index:10;color:transparent}.xterm .live-region{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}.xterm-dim{opacity:.5}.xterm-underline-1{text-decoration:underline}.xterm-underline-2{text-decoration:double underline}.xterm-underline-3{text-decoration:wavy underline}.xterm-underline-4{text-decoration:dotted underline}.xterm-underline-5{text-decoration:dashed underline}.xterm-strikethrough{text-decoration:line-through}.xterm-overline{text-decoration:overline}.xterm-decoration-container .xterm-decoration{z-index:6;position:absolute}.xterm-decoration-container .xterm-decoration.xterm-decoration-top-layer{z-index:7}.xterm-decoration-overview-ruler{z-index:8;position:absolute;top:0;right:0;pointer-events:none}.xterm-decoration-top{z-index:2;position:relative}`;
        document.head.appendChild(style);
      }

      if (termRef.current) {
        termRef.current.dispose();
      }

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        theme: {
          background: '#0a0a0a',
          foreground: '#e8e8e8',
          cursor: '#00ff88',
          selectionBackground: '#1c2340',
          black: '#0a0a0a',
          red: '#e74c3c',
          green: '#00ff88',
          yellow: '#f1c40f',
          blue: '#5B6CF9',
          magenta: '#9b59b6',
          cyan: '#3EEDB0',
          white: '#e8e8e8',
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

      if (terminalRef.current) {
        terminalRef.current.innerHTML = '';
        term.open(terminalRef.current);
        fitAddon.fit();
      }

      termRef.current = term;

      // Conecta WebSocket
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        onStatusChange?.(true);
        // Envia resize inicial
        ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      };

      // Regex para detectar URLs de auth do Claude Code
      const authUrlRegex = /https:\/\/(?:auth\.anthropic\.com|console\.anthropic\.com|claude\.ai\/?\S*auth)\S*/g;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'output') {
            term.write(msg.data);

            // Emite output line para o IntelliChat
            if (onOutputLine) {
              onOutputLine(msg.data);
            }

            // Detecta URLs de autenticação do Claude
            const plainText = msg.data.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
            const authMatch = plainText.match(authUrlRegex);
            if (authMatch) {
              setAuthBanner(authMatch[0]);
            }
          } else if (msg.type === 'exit') {
            term.write('\r\n\x1b[33m[Sessão encerrada]\x1b[0m\r\n');
          }
        } catch {}
      };

      ws.onclose = () => {
        setStatus('idle');
        onStatusChange?.(false);
        term.write('\r\n\x1b[31m[Desconectado]\x1b[0m\r\n');
      };

      ws.onerror = () => {
        setStatus('error');
        onStatusChange?.(false);
        setErrorMsg('Falha na conexão WebSocket. Clique "Tentar novamente" para reconectar.');
      };

      // Terminal → WebSocket
      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }));
        }
      });

      // Resize
      term.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      });

      // Fit on window resize — store cleanup ref
      const handleResize = () => fitAddon.fit();
      window.addEventListener('resize', handleResize);
      resizeCleanupRef.current = () => {
        window.removeEventListener('resize', handleResize);
      };

      // Heartbeat a cada 5 min
      heartbeatRef.current = setInterval(() => {
        if (m) heartbeat(m.id);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 5 * 60 * 1000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Erro ao iniciar ambiente');
    }
  }, [onMachineChange, onStatusChange, onOutputLine]);

  // Auto-connect quando autoConnect=true
  const autoConnectDone = useRef(false);
  useEffect(() => {
    if (autoConnect && !autoConnectDone.current && status === 'idle') {
      autoConnectDone.current = true;
      connect();
    }
  }, [autoConnect, status, connect]);

  const disconnect = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (termRef.current) {
      termRef.current.dispose();
      termRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = undefined;
    }
    if (resizeCleanupRef.current) {
      resizeCleanupRef.current();
      resizeCleanupRef.current = null;
    }
    if (machine) {
      await destroyMachine(machine.id);
    }
    setMachine(null);
    onMachineChange?.(null);
    onStatusChange?.(false);
    setStatus('idle');
  }, [machine, onMachineChange, onStatusChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (termRef.current) termRef.current.dispose();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (resizeCleanupRef.current) resizeCleanupRef.current();
      onMachineChange?.(null);
    };
  }, []);

  if (status === 'idle') {
    return (
      <div style={{
        height: '100%',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: 'monospace',
        borderTop: '1px solid #1c2340',
      }}>
        <div style={{ fontSize: 11, color: '#5A6080', textTransform: 'uppercase', letterSpacing: 2 }}>Terminal</div>
        <button
          onClick={connect}
          style={{
            background: '#00ff88',
            color: '#000',
            border: 'none',
            borderRadius: 6,
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Iniciar Ambiente →
        </button>
        <p style={{ fontSize: 11, color: '#5A6080', margin: 0 }}>
          Node.js 22 + Claude Code + Skills pré-instalados
        </p>
      </div>
    );
  }

  if (status === 'starting') {
    return (
      <div style={{
        height: '100%',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontFamily: 'monospace',
        borderTop: '1px solid #1c2340',
      }}>
        <div style={{
          width: 20,
          height: 20,
          border: '2px solid #1c2340',
          borderTopColor: '#00ff88',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ fontSize: 13, color: '#5A6080' }}>Iniciando ambiente...</span>
        <span style={{ fontSize: 11, color: '#3a4060' }}>Criando container isolado</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        height: '100%',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontFamily: 'monospace',
        borderTop: '1px solid #1c2340',
      }}>
        <span style={{ fontSize: 13, color: '#e74c3c' }}>Erro: {errorMsg}</span>
        <button
          onClick={connect}
          style={{
            background: '#1c2340',
            color: '#e8e8e8',
            border: '1px solid #2a3050',
            borderRadius: 6,
            padding: '8px 20px',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0a0a',
      borderTop: '1px solid #1c2340',
    }}>
      {/* Auth banner */}
      {authBanner && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          background: 'rgba(91,108,249,.1)',
          borderBottom: '1px solid rgba(91,108,249,.2)',
          fontFamily: 'monospace',
          fontSize: 11,
        }}>
          <span style={{ color: '#5B6CF9' }}>∞</span>
          <a
            href={authBanner}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => window.open(authBanner!, '_blank')}
            style={{ color: '#5B6CF9', textDecoration: 'underline', cursor: 'pointer', flex: 1 }}
          >
            Autenticar Claude Code →
          </a>
          <button
            onClick={() => setAuthBanner(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#5A6080',
              cursor: 'pointer',
              fontSize: 14,
              padding: '0 4px',
              fontFamily: 'monospace',
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 14px',
        background: '#0f1428',
        borderBottom: '1px solid #1c2340',
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#5A6080',
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#3EEDB0',
        }} />
        <span>TERMINAL · {machine?.fly_region || 'gru'}</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={disconnect}
          style={{
            background: 'none',
            border: '1px solid #1c2340',
            borderRadius: 3,
            color: '#5A6080',
            fontSize: 10,
            padding: '2px 8px',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Desconectar
        </button>
      </div>
      <div
        ref={terminalRef}
        style={{ flex: 1, padding: 4 }}
      />
    </div>
  );
}
