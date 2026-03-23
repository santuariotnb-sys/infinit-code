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

  // Local mode
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

  // Container mode
  useEffect(() => {
    if (!isContainerMode) {
      setDevServerStatus('unknown');
      startedRef.current = false;
      return;
    }

    const checkServer = async () => {
      try {
        const res = await fetch(`/api/ide/preview?path=/&_check=1&_t=${Date.now()}`);
        const text = await res.text();
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

      if (!startedRef.current && sendCommand) {
        startedRef.current = true;
        setDevServerStatus('starting');
        sendCommand('npm run dev 2>/dev/null || npx next dev 2>/dev/null || npx vite 2>/dev/null || echo "Nenhum dev server encontrado"');

        let attempts = 0;
        pollingRef.current = setInterval(async () => {
          attempts++;
          const up = await checkServer();
          if (up) {
            setDevServerStatus('running');
            setRefreshKey(k => k + 1);
            if (pollingRef.current) clearInterval(pollingRef.current);
          } else if (attempts > 15) {
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
      setRefreshKey(k => k + 1);
    }
  }, [sendCommand]);

  // Empty state
  if (!isContainerMode && !activeFile) {
    return (
      <div style={{
        height: '100%',
        background: '#06060f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 10,
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#6e7191',
        fontSize: 13,
      }}>
        <span style={{ fontSize: 28, opacity: 0.3 }}>▶</span>
        <span>Nenhum preview disponível</span>
      </div>
    );
  }

  const statusDot = isContainerMode
    ? devServerStatus === 'running' ? '#3EEDB0'
      : devServerStatus === 'starting' ? '#f1c40f'
      : '#e74c3c'
    : '#3EEDB0';

  return (
    <div style={{
      height: '100%',
      background: '#06060f',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid rgba(124, 92, 252, 0.08)',
    }}>
      {/* Header */}
      <div style={{
        padding: '0 14px',
        height: 30,
        background: '#0c0c1d',
        borderBottom: '1px solid rgba(124, 92, 252, 0.08)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        color: '#6e7191',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: statusDot,
          boxShadow: devServerStatus === 'running' || !isContainerMode
            ? `0 0 6px ${statusDot}66` : 'none',
        }} />
        <span style={{ fontWeight: 500, letterSpacing: 0.5 }}>
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
              border: '1px solid rgba(124, 92, 252, 0.12)',
              borderRadius: 4,
              color: '#6e7191',
              fontSize: 10,
              padding: '2px 8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
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
              gap: 14,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              <div style={{
                width: 22, height: 22,
                border: '2px solid rgba(124, 92, 252, 0.15)',
                borderTopColor: '#7c5cfc',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{ fontSize: 12, color: '#6e7191' }}>Iniciando dev server...</span>
              <span style={{ fontSize: 10, color: '#4a4f6e' }}>npm run dev · Aguardando porta 3000</span>
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
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              <span style={{ fontSize: 28, opacity: 0.3 }}>⚠</span>
              <span style={{ fontSize: 13, color: '#6e7191', fontWeight: 500 }}>Dev server não respondeu</span>
              <span style={{ fontSize: 11, color: '#4a4f6e' }}>Verifique o terminal para erros</span>
              <button
                onClick={handleRetryDevServer}
                style={{
                  background: 'rgba(124, 92, 252, 0.08)',
                  border: '1px solid rgba(124, 92, 252, 0.15)',
                  borderRadius: 6,
                  color: '#a78bfa',
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '8px 18px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginTop: 4,
                  transition: 'all 0.2s',
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
