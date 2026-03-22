'use client';

import { useEffect, useRef, useState } from 'react';
import { useIDEStore } from '@/lib/ide/store';
import { getPreviewHtml } from '@/lib/ide/preview-engine';

export function PreviewPanel() {
  const { openFiles, activeFileId } = useIDEStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const activeFile = openFiles.find(f => f.id === activeFileId);

  useEffect(() => {
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
  }, [activeFile?.content, activeFile?.name, activeFile?.id]);

  if (!activeFile) {
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
          width: 6, height: 6, borderRadius: '50%', background: '#3EEDB0',
          animation: 'pulse 2s infinite',
        }} />
        <span>PREVIEW · {activeFile.name}</span>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
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
      </div>
    </div>
  );
}
