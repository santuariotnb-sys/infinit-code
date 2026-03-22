'use client';

import { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useIDEStore } from '@/lib/ide/store';
import { TabBar } from './TabBar';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5A6080', fontFamily: 'monospace', fontSize: 13 }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a' }}>
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
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
          color: '#5A6080',
          fontFamily: 'monospace',
        }}>
          <span style={{ fontSize: 48, color: '#1c2340' }}>∞</span>
          <span style={{ fontSize: 13 }}>Selecione um arquivo para editar</span>
        </div>
      )}
    </div>
  );
}
