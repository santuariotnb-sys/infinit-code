'use client';

import { useEffect, useState } from 'react';

export function GitHubConnect() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch('/api/ide/github/status')
      .then(r => {
        if (!r.ok) throw new Error('Status check failed');
        return r.json();
      })
      .then(d => {
        setConnected(d.connected);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: '#1c2340',
        border: '1px solid #2a3050',
        borderRadius: 4,
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#5A6080',
      }}>
        <div style={{
          width: 10,
          height: 10,
          border: '1.5px solid #2a3050',
          borderTopColor: '#5A6080',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        Verificando GitHub...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (connected) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        background: 'rgba(0,255,136,.08)',
        border: '1px solid rgba(0,255,136,.15)',
        borderRadius: 4,
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#00ff88',
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        GitHub conectado
      </div>
    );
  }

  return (
    <button
      onClick={() => { window.location.href = '/api/ide/github/connect'; }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: '#1c2340',
        border: '1px solid #2a3050',
        borderRadius: 4,
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#AEB6D8',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      Conectar GitHub
      {error && (
        <span
          title="Falha ao verificar status do GitHub"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#e74c3c',
            position: 'absolute',
            top: 2,
            right: 2,
          }}
        />
      )}
    </button>
  );
}
