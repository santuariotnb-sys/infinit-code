'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useIDEStore } from '@/lib/ide/store';
import { getPreviewHtml } from '@/lib/ide/preview-engine';
import type { MachineSession } from '@/lib/ide/machine-client';

interface PreviewPanelProps {
  machine?: MachineSession | null;
  sendCommand?: (cmd: string) => void;
}

export function PreviewPanel({ machine, sendCommand }: PreviewPanelProps) {
  const { openFiles, activeFileId, machineConnected } = useIDEStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [devServerStatus, setDevServerStatus] = useState<'unknown' | 'starting' | 'running' | 'failed'>('unknown');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const pollingRef = useRef<ReturnType<typeof setInterval>>();
  const startedRef = useRef(false);

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const isContainerMode = machineConnected && !!machine;

  // Modo local: gera preview do conteúdo em memória
  useEffect(() => {
    if (isContainerMode) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (activeFile) {
        setPreviewHtml(getPreviewHtml(activeFile.name, activeFile.content));
      } else {
        setPreviewHtml('');
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeFile?.content, activeFile?.name, activeFile?.id, isContainerMode]);

  // Container mode: check dev server + auto-start
  useEffect(() => {
    if (!isContainerMode) {
      setDevServerStatus('unknown');
      startedRef.current = false;
      return;
    }

    // Check if dev server is running
    const checkServer = async () => {
      try {
        const res = await fetch(`/api/ide/preview?path=/&_check=1&_t=${Date.now()}`);
        const text = await res.text();
        // A API retorna HTML com "Dev server não está rodando" quando falha
        if (text.includes('Dev server não está rodando') || text.includes('Nenhum container ativo')) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    };

    const init = async () => {
      const running = await checkServer();
      if (running) {
        setDevServerStatus('running');
        setRefreshKey(k => k + 1);
        return;
      }

      // Auto-start dev server (only once)
      if (!startedRef.current && sendCommand) {
        startedRef.current = true;
        setDevServerStatus('starting');
        sendCommand('npm run dev 2>/dev/null || npx next dev 2>/dev/null || npx vite 2>/dev/null || echo "Nenhum dev server encontrado"');

        // Poll until server is up (max 45s)
        let attempts = 0;
        pollingRef.current = setInterval(async () => {
          attempts++;
          const up = await checkServer();
          if (up) {
            setDevServerStatus('running');
            setRefreshKey(k => k + 1);
            if (pollingRef.current) clearInterval(pollingRef.current);
          } else if (attempts > 15) {
            // 15 × 3s = 45s timeout
            setDevServerStatus('failed');
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }, 3000);
      } else {
        setDevServerStatus('failed');
      }
    };

    init();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isContainerMode, machine?.id, sendCommand]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleRetryDevServer = useCallback(() => {
    if (sendCommand) {
      startedRef.current = false;
      setDevServerStatus('unknown');
      // Force re-run of the init effect
      setRefreshKey(k => k + 1);
    }
  }, [sendCommand]);

  // Empty state
  if (!isContainerMode && !activeFile) {
    return (
      <div style={{
        height: '100%',
        background: '#0b0f1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'monospace',
        color: '#5A6080',
        fontSize: 13,
      }}>
        <span style={{ fontSize: 32 }}>👁️</span>
        <span>Nenhum preview disponível</span>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      background: '#0b0f1e',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #1c2340',
    }}>
      {/* Header bar */}
      <div style={{
        padding: '6px 14px',
        background: '#0f1428',
        borderBottom: '1px solid #1c2340',
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#5A6080',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: isContainerMode
            ? devServerStatus === 'running' ? '#3EEDB0'
              : devServerStatus === 'starting' ? '#f1c40f'
              : '#e74c3c'
            : '#f1c40f',
        }} />
        <span>
          {isContainerMode
            ? `PREVIEW · ${devServerStatus === 'running' ? 'localhost:3000' : devServerStatus === 'starting' ? 'Iniciando...' : 'Parado'}`
            : `PREVIEW · ${activeFile?.name || ''}`
          }
        </span>
        <div style={{ flex: 1 }} />
        {isContainerMode && devServerStatus === 'running' && (
          <button
            onClick={handleRefresh}
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
            ↻ Refresh
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative' }}>
        {isContainerMode ? (
          devServerStatus === 'starting' ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontFamily: 'monospace',
            }}>
              <div style={{
                width: 20,
                height: 20,
                border: '2px solid #1c2340',
                borderTopColor: '#00ff88',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{ fontSize: 12, color: '#5A6080' }}>Iniciando dev server...</span>
              <span style={{ fontSize: 10, color: '#3a4060' }}>npm run dev · Aguardando porta 3000</span>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : devServerStatus === 'failed' ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontFamily: 'monospace',
            }}>
              <span style={{ fontSize: 32 }}>🖥️</span>
              <span style={{ fontSize: 12, color: '#5A6080' }}>Dev server não respondeu</span>
              <span style={{ fontSize: 10, color: '#3a4060' }}>Verifique o terminal para erros</span>
              <button
                onClick={handleRetryDevServer}
                style={{
                  background: '#1c2340',
                  border: '1px solid #2a3050',
                  borderRadius: 6,
                  color: '#AEB6D8',
                  fontSize: 11,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  marginTop: 4,
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <iframe
              key={refreshKey}
              ref={iframeRef}
              src={`/api/ide/preview?path=/&_t=${refreshKey}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#fff',
              }}
            />
          )
        ) : (
          <iframe
            ref={iframeRef}
            srcDoc={previewHtml}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#fff',
            }}
          />
        )}
      </div>
    </div>
  );
}
