'use client';

import { useState } from 'react';
import { snippets } from '@/lib/ide/snippets-data';
import { useIDEStore } from '@/lib/ide/store';

export function SnippetsPanel() {
  const { insertAtCursor, showSnippets } = useIDEStore();
  const [search, setSearch] = useState('');
  const [inserted, setInserted] = useState<number | null>(null);

  if (!showSnippets) return null;

  const filtered = snippets.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleInsert = (index: number) => {
    insertAtCursor(filtered[index].code);
    setInserted(index);
    setTimeout(() => setInserted(null), 1500);
  };

  return (
    <div style={{
      width: 320,
      background: '#0b0f1e',
      borderLeft: '1px solid #1c2340',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px',
        background: '#0f1428',
        borderBottom: '1px solid #1c2340',
        fontFamily: 'monospace',
        fontSize: 13,
        fontWeight: 700,
        color: '#E8EAF6',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ color: '#3EEDB0' }}>∞</span>
        Snippets
      </div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar snippets..."
        style={{
          width: '100%',
          background: '#0f1428',
          border: 'none',
          borderBottom: '1px solid #1c2340',
          padding: '10px 14px',
          color: '#E8EAF6',
          fontFamily: 'monospace',
          fontSize: 12,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((s, i) => (
          <div key={s.label} style={{
            background: '#0f1428',
            border: '1px solid #1c2340',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: '#131829',
              borderBottom: '1px solid #1c2340',
            }}>
              <span style={{ flex: 1, fontWeight: 700, color: '#E8EAF6', fontFamily: 'monospace', fontSize: 12 }}>{s.label}</span>
              <span style={{
                color: '#5B6CF9',
                fontSize: 10,
                background: 'rgba(91,108,249,.12)',
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: 'monospace',
              }}>{s.lang}</span>
              <button
                onClick={() => handleInsert(i)}
                style={{
                  background: '#3EEDB0',
                  color: '#050710',
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 10px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {inserted === i ? '✓' : 'Insert →'}
              </button>
            </div>
            <pre style={{
              padding: 12,
              fontSize: 11,
              lineHeight: 1.6,
              color: '#8892b0',
              overflow: 'auto',
              whiteSpace: 'pre',
              margin: 0,
              fontFamily: 'monospace',
            }}>
              {s.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
