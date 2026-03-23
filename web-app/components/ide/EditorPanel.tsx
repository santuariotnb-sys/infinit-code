'use client';

import { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useIDEStore } from '@/lib/ide/store';
import { TabBar } from './TabBar';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6e7191', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>
      Carregando editor...
    </div>
  ),
});

export function EditorPanel() {
  const { openFiles, activeFileId, updateFileContent, setCursorInsertCallback } = useIDEStore();
  const editorRef = useRef<any>(null);

  const activeFile = openFiles.find(f => f.id === activeFileId);

  const handleEditorMount = useCallback((editor: any) => {
    editorRef.current = editor;
    setCursorInsertCallback((text: string) => {
      if (!editorRef.current) return;
      const position = editorRef.current.getPosition();
      if (!position) return;
      editorRef.current.executeEdits('snippet-insert', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text,
      }]);
    });
  }, [setCursorInsertCallback]);

  const handleChange = useCallback((value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  }, [activeFileId, updateFileContent]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#06060f' }}>
      <TabBar />
      {activeFile ? (
        <div style={{ flex: 1 }}>
          <MonacoEditor
            key={activeFile.id}
            height="100%"
            language={activeFile.language}
            value={activeFile.content}
            onChange={handleChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 13,
              lineHeight: 20,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              renderLineHighlight: 'line',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              tabSize: 2,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Space Grotesk', sans-serif",
      padding: 32,
    }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontSize: 48,
            fontWeight: 800,
            color: '#7c5cfc',
            opacity: 0.15,
            marginBottom: 16,
            fontFamily: "'Syne', sans-serif",
          }}>∞</div>
          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#e2e4f0',
            margin: '0 0 8px',
            fontFamily: "'Syne', sans-serif",
          }}>
            Pronto para criar
          </h2>
          <p style={{
            fontSize: 13,
            color: '#6e7191',
            margin: 0,
            lineHeight: 1.6,
          }}>
            Comece clonando um repo, criando um arquivo ou pedindo ao Claude.
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <QuickAction
            icon="⑂"
            title="Clonar repositório"
            desc="Importe um projeto do GitHub para começar"
            shortcut="Toolbar → Clone"
          />
          <QuickAction
            icon=">_"
            title="Abrir terminal"
            desc="Crie arquivos, instale pacotes, rode comandos"
            shortcut="Toolbar → Terminal"
          />
          <QuickAction
            icon="∞"
            title="Pedir ao Claude"
            desc="Descreva o que quer construir no chat"
            shortcut="Toolbar → Chat"
          />
        </div>

        {/* Tip */}
        <div style={{
          marginTop: 32,
          padding: '12px 16px',
          background: 'rgba(124, 92, 252, 0.04)',
          border: '1px solid rgba(124, 92, 252, 0.08)',
          borderRadius: 8,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 14, color: '#7c5cfc', flexShrink: 0, marginTop: 1 }}>💡</span>
          <div>
            <span style={{ fontSize: 11, color: '#6e7191', lineHeight: 1.6 }}>
              <strong style={{ color: '#a78bfa' }}>Dica:</strong> Digite{' '}
              <code style={{
                background: 'rgba(124, 92, 252, 0.1)',
                padding: '1px 5px',
                borderRadius: 3,
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#a78bfa',
              }}>claude</code>{' '}
              no terminal para iniciar o Claude Code com skills exclusivas do Infinit Code.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, desc, shortcut }: { icon: string; title: string; desc: string; shortcut: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      background: 'rgba(12, 12, 29, 0.8)',
      border: '1px solid rgba(124, 92, 252, 0.08)',
      borderRadius: 10,
      cursor: 'default',
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: 8,
        background: 'rgba(124, 92, 252, 0.08)',
        border: '1px solid rgba(124, 92, 252, 0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
        color: '#a78bfa',
        fontFamily: 'monospace',
        fontWeight: 700,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e4f0', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#6e7191', lineHeight: 1.4 }}>{desc}</div>
      </div>
      <span style={{
        fontSize: 9,
        color: '#4a4f6e',
        fontFamily: "'JetBrains Mono', monospace",
        flexShrink: 0,
        letterSpacing: 0.5,
      }}>{shortcut}</span>
    </div>
  );
}
