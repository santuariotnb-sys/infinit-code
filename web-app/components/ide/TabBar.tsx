'use client';

import { useIDEStore } from '@/lib/ide/store';

export function TabBar() {
  const { openFiles, activeFileId, setActiveFile, closeFile } = useIDEStore();

  if (openFiles.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      background: '#0f1428',
      borderBottom: '1px solid #1c2340',
      overflow: 'auto',
      scrollbarWidth: 'none',
    }}>
      {openFiles.map(f => (
        <div
          key={f.id}
          onClick={() => setActiveFile(f.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            fontSize: 12,
            fontFamily: 'monospace',
            cursor: 'pointer',
            color: f.id === activeFileId ? '#e8e8e8' : '#5A6080',
            background: f.id === activeFileId ? '#0a0a0a' : 'transparent',
            borderRight: '1px solid #1c2340',
            whiteSpace: 'nowrap',
          }}
        >
          {f.unsaved && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', flexShrink: 0 }} />
          )}
          <span>{f.name}</span>
          <span
            onClick={(e) => { e.stopPropagation(); closeFile(f.id); }}
            style={{
              marginLeft: 4,
              fontSize: 14,
              color: '#5A6080',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e8e8e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5A6080')}
          >
            ×
          </span>
        </div>
      ))}
    </div>
  );
}
