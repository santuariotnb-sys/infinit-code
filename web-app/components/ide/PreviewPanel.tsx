'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useIDEStore } from '@/lib/ide/store';
import { getPreviewHtml } from '@/lib/ide/preview-engine';
import type { MachineSession } from '@/lib/ide/machine-client';

interface PreviewPanelProps {
  machine?: MachineSession | null;
}

export function PreviewPanel({ machine }: PreviewPanelProps) {
  const { openFiles, activeFileId, machineConnected } = useIDEStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

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
          background: isContainerMode ? '#3EEDB0' : '#f1c40f',
        }} />
        <span>
          {isContainerMode
            ? 'PREVIEW · localhost:3000'
            : `PREVIEW · ${activeFile?.name || ''}`
          }
        </span>
        <div style={{ flex: 1 }} />
        {isContainerMode && (
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

      {/* iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        {isContainerMode ? (
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
