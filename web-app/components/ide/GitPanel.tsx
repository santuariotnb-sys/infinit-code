'use client';

import { useState } from 'react';

interface GitPanelProps {
  onRunCommand: (command: string) => void;
}

export function GitPanel({ onRunCommand }: GitPanelProps) {
  const [commitMsg, setCommitMsg] = useState('');
  const [pushing, setPushing] = useState(false);

  const handleCommit = () => {
    if (!commitMsg.trim()) return;
    const sanitized = commitMsg
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')
      .replace(/!/g, '\\!');
    onRunCommand(`git add -A && git commit -m "${sanitized}"`);;
    setCommitMsg('');
  };

  const handlePush = () => {
    setPushing(true);
    onRunCommand('git push origin HEAD');
    setTimeout(() => setPushing(false), 3000);
  };

  return (
    <div style={{
      background: '#0b0f1e',
      borderTop: '1px solid #1c2340',
      padding: '10px 14px',
      fontFamily: 'monospace',
      fontSize: 11,
    }}>
      <div style={{
        color: '#5A6080',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        fontSize: 10,
      }}>
        Git
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button
          onClick={() => onRunCommand('git status')}
          style={btnStyle}
        >
          Status
        </button>
        <button
          onClick={() => onRunCommand('git diff --stat')}
          style={btnStyle}
        >
          Diff
        </button>
        <button
          onClick={() => onRunCommand('git log --oneline -5')}
          style={btnStyle}
        >
          Log
        </button>
        <button
          onClick={handlePush}
          disabled={pushing}
          style={{
            ...btnStyle,
            background: pushing ? '#1c2340' : 'rgba(0,255,136,.1)',
            color: pushing ? '#5A6080' : '#00ff88',
            borderColor: pushing ? '#1c2340' : 'rgba(0,255,136,.2)',
          }}
        >
          {pushing ? 'Pushing...' : 'Push'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCommit(); }}
          placeholder="Mensagem do commit..."
          style={{
            flex: 1,
            background: '#0f1428',
            border: '1px solid #1c2340',
            borderRadius: 4,
            padding: '5px 8px',
            color: '#e8e8e8',
            fontFamily: 'monospace',
            fontSize: 11,
            outline: 'none',
          }}
        />
        <button
          onClick={handleCommit}
          disabled={!commitMsg.trim()}
          style={{
            ...btnStyle,
            background: commitMsg.trim() ? '#00ff88' : '#1c2340',
            color: commitMsg.trim() ? '#000' : '#5A6080',
            fontWeight: 700,
          }}
        >
          Commit
        </button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: '#0f1428',
  border: '1px solid #1c2340',
  borderRadius: 4,
  color: '#AEB6D8',
  fontSize: 10,
  padding: '4px 8px',
  cursor: 'pointer',
  fontFamily: 'monospace',
};
