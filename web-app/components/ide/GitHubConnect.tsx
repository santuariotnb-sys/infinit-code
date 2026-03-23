'use client';

import { useEffect, useState, useRef } from 'react';

export function GitHubConnect() {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        setUsername(d.username || null);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  const handleDisconnect = async () => {
    setShowDropdown(false);
    try {
      await fetch('/api/ide/github/status', { method: 'DELETE' });
      setConnected(false);
      setUsername(null);
      window.location.reload();
    } catch {}
  };

  const handleSwitch = () => {
    setShowDropdown(false);
    window.location.href = '/api/ide/github/connect';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
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
        GitHub...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (connected) {
    return (
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
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
            cursor: 'pointer',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          {username || 'GitHub'}
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" style={{ opacity: 0.6 }}>
            <path d="M4 6L1 2h6L4 6z"/>
          </svg>
        </button>

        {showDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: '#0f1428',
            border: '1px solid #1c2340',
            borderRadius: 6,
            overflow: 'hidden',
            minWidth: 160,
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,.4)',
          }}>
            <button
              onClick={handleSwitch}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #1c2340',
                color: '#AEB6D8',
                fontSize: 11,
                fontFamily: 'monospace',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1c2340')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M4 4l17 17"/>
              </svg>
              Trocar conta
            </button>
            <button
              onClick={handleDisconnect}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: '#e74c3c',
                fontSize: 11,
                fontFamily: 'monospace',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1c2340')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Desconectar
            </button>
          </div>
        )}
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
        padding: '4px 10px',
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
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      Conectar GitHub
      {error && (
        <span
          title="Falha ao verificar status"
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
