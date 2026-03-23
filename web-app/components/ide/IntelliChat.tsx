'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useIDEStore } from '@/lib/ide/store';
import type { OpenFile } from '@/lib/ide/types';
import type { MachineSession } from '@/lib/ide/machine-client';

interface IntelliChatProps {
  terminalSendCommand: (cmd: string) => void;
  terminalOutput: string;
  onOutputSubscribe: (cb: (line: string) => void) => () => void;
  activeFile: OpenFile | null;
  machine: MachineSession | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { name: string; content: string }[];
  timestamp: Date;
}

type ClaudeStatus = 'Pronto' | 'Iniciando...' | 'Pensando...' | 'Desconectado';

// Strip ANSI escape codes
function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/\x1b\][^\x07]*\x07/g, '');
}

const quickActions = [
  { icon: '{ }', title: 'Criar projeto', desc: 'Next.js, React', prompt: 'Crie um projeto Next.js 14 com TypeScript, Tailwind e Supabase. Configure auth e crie uma landing page.' },
  { icon: '⑂', title: 'Clonar repo', desc: 'Do GitHub', prompt: 'Clone o repositório [URL] e configure o ambiente de desenvolvimento.' },
  { icon: '⊙', title: 'Analisar código', desc: 'Review e refactor', prompt: 'Analise o código deste projeto. Aponte problemas, melhorias e sugira refatorações.' },
  { icon: '⚡', title: 'Corrigir bug', desc: 'Debug automático', prompt: 'Tenho um erro: [cole o erro aqui]. Encontre e corrija a causa raiz.' },
  { icon: '◈', title: 'Dependências', desc: 'npm install', prompt: 'Instale e configure as dependências necessárias para este projeto.' },
  { icon: '⬆', title: 'Deploy', desc: 'Vercel, Netlify, Fly', prompt: 'Prepare este projeto para deploy na Vercel. Configure variáveis de ambiente e otimize o build.' },
];

function getSuggestions(activeFile: OpenFile | null): string[] {
  if (!activeFile) {
    return ['Crie um CLAUDE.md', 'Mostre a estrutura do projeto', 'Instale as dependências', 'Inicie o dev server'];
  }
  const ext = activeFile.name.split('.').pop()?.toLowerCase();
  if (ext === 'tsx') return ['Adicione TypeScript types', 'Extraia componente', 'Adicione testes unitários', 'Otimize re-renders'];
  if (ext === 'ts') return ['Adicione tratamento de erro', 'Adicione JSDoc', 'Otimize performance', 'Adicione validação'];
  if (ext === 'sql') return ['Adicione RLS policies', 'Otimize query', 'Adicione índices'];
  return ['Explique este código', 'Refatore para melhorar', 'Adicione testes', 'Documente'];
}

export function IntelliChat({ terminalSendCommand, terminalOutput, onOutputSubscribe, activeFile, machine }: IntelliChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ClaudeStatus>('Desconectado');
  const [attachments, setAttachments] = useState<{ name: string; content: string }[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [showMention, setShowMention] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const responseBufferRef = useRef('');
  const isRespondingRef = useRef(false); // ref para subscriber não ficar stale
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const claudeRunningRef = useRef(false);

  const { openFiles, openFile: storeOpenFile, files } = useIDEStore();

  // Sync ref with state
  useEffect(() => { isRespondingRef.current = isResponding; }, [isResponding]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  // Flush response buffer → message
  const flushResponse = useCallback(() => {
    const response = stripAnsi(responseBufferRef.current).trim();
    if (response) {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      setMessages(prev => [...prev, { id, role: 'assistant', content: response, timestamp: new Date() }]);
    }
    responseBufferRef.current = '';
    setIsResponding(false);
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  }, []);

  // Subscribe to terminal output — stable ref, no isResponding in deps
  useEffect(() => {
    // Claude Code prompt patterns (with or without ANSI)
    const promptPattern = /(?:claude|❯|>)\s*$/;

    const unsub = onOutputSubscribe((chunk: string) => {
      const clean = stripAnsi(chunk);

      // Detect Claude Code prompt → response finished
      if (promptPattern.test(clean.trim())) {
        claudeRunningRef.current = true;
        if (isRespondingRef.current) {
          flushResponse();
        }
        setStatus('Pronto');
        return;
      }

      // Detect "Thinking" status (specific, not generic "...")
      if (isRespondingRef.current && /think/i.test(clean)) {
        setStatus('Pensando...');
      }

      // Accumulate response while responding
      if (isRespondingRef.current) {
        responseBufferRef.current += chunk;
        // Reset timeout — if no new output for 20s, flush
        if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
        responseTimeoutRef.current = setTimeout(() => {
          if (isRespondingRef.current) {
            flushResponse();
            setStatus('Pronto');
          }
        }, 20000);
      }
    });
    return unsub;
  }, [onOutputSubscribe, flushResponse]);

  // Update status based on machine
  useEffect(() => {
    if (!machine) {
      setStatus('Desconectado');
      claudeRunningRef.current = false;
    } else if (status === 'Desconectado') {
      setStatus('Pronto');
    }
  }, [machine]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
    };
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const userMsg: ChatMessage = {
      id,
      role: 'user',
      content: text,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);

    // Build full command with attachments context
    let fullText = text;
    if (userMsg.attachments?.length) {
      const ctx = userMsg.attachments.map(a => `<file name="${a.name}">${a.content}</file>`).join('\n');
      fullText = `${ctx}\n\n${text}`;
    }

    // Send to terminal
    if (!claudeRunningRef.current) {
      // Start Claude Code first
      setStatus('Iniciando...');
      terminalSendCommand('claude --dangerously-skip-permissions');
      setTimeout(() => {
        terminalSendCommand(fullText);
        setIsResponding(true);
        setStatus('Pensando...');
        responseBufferRef.current = '';
      }, 2500);
    } else {
      terminalSendCommand(fullText);
      setIsResponding(true);
      setStatus('Pensando...');
      responseBufferRef.current = '';
    }
  }, [input, attachments, terminalSendCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // @ mention
    if (e.key === '@') {
      setShowMention(true);
    }
  }, [handleSend]);

  const handleFileAttach = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    Array.from(fileList).forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, { name: f.name, content: (reader.result as string).slice(0, 5000) }]);
      };
      reader.readAsText(f);
    });
    e.target.value = '';
  }, []);

  const handleInsertActiveFile = useCallback(() => {
    if (!activeFile) return;
    const content = activeFile.content.split('\n').slice(0, 200).join('\n');
    setAttachments(prev => [...prev, { name: activeFile.name, content }]);
  }, [activeFile]);

  const handleMentionSelect = useCallback((file: { id: string; name: string; content?: string }) => {
    setShowMention(false);
    if (file.content) {
      setAttachments(prev => [...prev, { name: file.name, content: file.content!.slice(0, 5000) }]);
    }
  }, []);

  const removeAttachment = useCallback((idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const suggestions = getSuggestions(activeFile);

  // Render code blocks, file paths
  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*|\/root\/workspace\/\S+)/gm);
    return parts.map((p, i) => {
      // Code blocks
      if (p.startsWith('```') && p.endsWith('```')) {
        const raw = p.slice(3, -3);
        const code = raw.replace(/^\w+\n/, '');
        // Detect if it's a shell command block
        const isShell = /^(sh|bash|shell|zsh)?\n/i.test(raw) || /^\$\s/.test(code.trim());
        return (
          <div key={i} style={{ position: 'relative', margin: '8px 0' }}>
            <pre style={{ background: '#0a0a0a', border: '1px solid #1c2340', borderRadius: 6, padding: '8px 12px', overflow: 'auto', fontSize: 11, color: '#AEB6D8', fontFamily: "'JetBrains Mono', monospace" }}>{code}</pre>
            <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
              {isShell && (
                <button
                  onClick={() => terminalSendCommand(code.replace(/^\$\s*/gm, '').trim())}
                  style={{ background: 'rgba(0,255,136,.15)', border: 'none', borderRadius: 3, color: '#3EEDB0', fontSize: 9, padding: '2px 6px', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  Executar
                </button>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                style={{ background: '#1c2340', border: 'none', borderRadius: 3, color: '#5A6080', fontSize: 9, padding: '2px 6px', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                Copiar
              </button>
            </div>
          </div>
        );
      }
      // Inline code
      if (p.startsWith('`') && p.endsWith('`')) {
        return <code key={i} style={{ background: '#0f1428', padding: '1px 5px', borderRadius: 3, fontSize: 11, color: '#3EEDB0' }}>{p.slice(1, -1)}</code>;
      }
      // Bold
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={i} style={{ color: '#e8e8e8' }}>{p.slice(2, -2)}</strong>;
      }
      // File paths
      if (p.startsWith('/root/workspace/')) {
        const fileName = p.split('/').pop() || p;
        return (
          <button
            key={i}
            onClick={() => {
              const node = findFileByPath(files, p.replace('/root/workspace/', ''));
              if (node) storeOpenFile(node);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#0f1428',
              border: '1px solid #1c2340',
              borderRadius: 4,
              padding: '2px 8px',
              margin: '2px 0',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#5B6CF9',
            }}
          >
            📄 {fileName}
          </button>
        );
      }
      return <span key={i}>{p}</span>;
    });
  };

  // Welcome screen
  if (messages.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0b0f1e', fontFamily: 'monospace' }}>
        {/* Header */}
        <div style={{ padding: '8px 16px', background: '#0f1428', borderBottom: '1px solid #1c2340', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#5A6080' }}>
          <span style={{ color: '#00ff88', fontSize: 14 }}>∞</span>
          <span style={{ fontWeight: 700, color: '#e8e8e8' }}>Claude Code</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: status === 'Pronto' ? '#3EEDB0' : status === 'Pensando...' ? '#f1c40f' : '#5A6080' }} />
          <span>{status}</span>
        </div>

        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, color: '#00ff88', marginBottom: 8 }}>∞</div>
            <h2 style={{ fontSize: 16, color: '#e8e8e8', margin: '0 0 4px', fontWeight: 600 }}>O que vamos construir?</h2>
            <p style={{ fontSize: 11, color: '#5A6080', margin: 0 }}>Claude Code integrado · Node.js 22 · Deploy automático</p>
          </div>

          {/* Quick actions grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxWidth: 340, width: '100%' }}>
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={() => { setInput(a.prompt); inputRef.current?.focus(); }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a3050')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1c2340')}
                style={{ background: '#0f1428', border: '1px solid #1c2340', borderRadius: 8, padding: '10px', cursor: 'pointer', textAlign: 'left', fontFamily: 'monospace', transition: 'border-color .15s' }}
              >
                <div style={{ fontSize: 16, marginBottom: 4, color: '#5A6080' }}>{a.icon}</div>
                <div style={{ fontSize: 11, color: '#e8e8e8', fontWeight: 600, marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 10, color: '#5A6080' }}>{a.desc}</div>
              </button>
            ))}
          </div>

          {/* Contextual suggestions */}
          <div style={{ maxWidth: 340, width: '100%' }}>
            <div style={{ fontSize: 9, color: '#5A6080', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              {activeFile ? `Sugestões para ${activeFile.name}` : 'Sugestões'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  style={{ background: '#0f1428', border: '1px solid #1c2340', borderRadius: 12, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, color: '#AEB6D8', transition: 'border-color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a3050')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#1c2340')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input area */}
        {renderInputArea()}
      </div>
    );
  }

  // Chat messages view
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0b0f1e', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ padding: '8px 16px', background: '#0f1428', borderBottom: '1px solid #1c2340', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#5A6080' }}>
        <span style={{ color: '#00ff88', fontSize: 14 }}>∞</span>
        <span style={{ fontWeight: 700, color: '#e8e8e8' }}>Claude Code</span>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: status === 'Pronto' ? '#3EEDB0' : status === 'Pensando...' ? '#f1c40f' : '#5A6080' }} />
        <span>{status}</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setMessages([])} style={{ background: 'none', border: '1px solid #1c2340', borderRadius: 3, color: '#5A6080', fontSize: 10, padding: '2px 8px', cursor: 'pointer', fontFamily: 'monospace' }}>
          Nova conversa
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {/* Avatar */}
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: msg.role === 'user' ? 'rgba(91,108,249,.1)' : '#00ff88',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, flexShrink: 0,
              color: msg.role === 'user' ? '#5B6CF9' : '#000',
              fontWeight: 700,
            }}>
              {msg.role === 'user' ? '→' : '∞'}
            </div>
            {/* Content */}
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 4px',
              background: msg.role === 'user' ? '#1c2340' : '#0f1428',
              border: `1px solid ${msg.role === 'user' ? '#2a3050' : '#1c2340'}`,
              fontSize: 12, color: '#e8e8e8', lineHeight: 1.6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {/* Attachments */}
              {msg.attachments?.map((a, i) => (
                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#0a0a0a', border: '1px solid #1c2340', borderRadius: 4, padding: '2px 8px', marginBottom: 6, marginRight: 4, fontSize: 10, color: '#5A6080' }}>
                  📎 {a.name}
                </div>
              ))}
              {renderContent(msg.content)}
            </div>
          </div>
        ))}

        {/* Streaming cursor */}
        {isResponding && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#000', fontWeight: 700, flexShrink: 0 }}>∞</div>
            <div style={{ padding: '10px 14px', background: '#0f1428', border: '1px solid #1c2340', borderRadius: '12px 12px 12px 4px', fontSize: 12, color: '#5A6080' }}>
              <span style={{ animation: 'blink 1s infinite' }}>▋</span>
              <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {renderInputArea()}
    </div>
  );

  function renderInputArea() {
    return (
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1c2340', background: '#0b0f1e' }}>
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {attachments.map((a, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#0f1428', border: '1px solid #1c2340', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#AEB6D8' }}>
                📎 {a.name}
                <button onClick={() => removeAttachment(i)} style={{ background: 'none', border: 'none', color: '#5A6080', cursor: 'pointer', fontSize: 12, padding: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <button onClick={() => fileInputRef.current?.click()} title="Anexar arquivo local" style={{ background: '#0f1428', border: '1px solid #1c2340', borderRadius: 4, color: '#5A6080', fontSize: 11, padding: '2px 8px', cursor: 'pointer', fontFamily: 'monospace' }}>
            📎
          </button>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileAttach} accept=".ts,.tsx,.js,.jsx,.json,.md,.txt,.sql,.html,.css,.py" />
          <button onClick={handleInsertActiveFile} disabled={!activeFile} title="Inserir arquivo ativo" style={{ background: '#0f1428', border: '1px solid #1c2340', borderRadius: 4, color: activeFile ? '#5A6080' : '#2a3050', fontSize: 11, padding: '2px 8px', cursor: activeFile ? 'pointer' : 'default', fontFamily: 'monospace' }}>
            📁
          </button>
          <button onClick={() => setShowMention(!showMention)} title="Mencionar arquivo (@)" style={{ background: '#0f1428', border: '1px solid #1c2340', borderRadius: 4, color: '#5A6080', fontSize: 11, padding: '2px 8px', cursor: 'pointer', fontFamily: 'monospace' }}>
            @
          </button>
        </div>

        {/* @ mention dropdown */}
        {showMention && (
          <div style={{ background: '#0f1428', border: '1px solid #1c2340', borderRadius: 6, marginBottom: 6, maxHeight: 120, overflow: 'auto' }}>
            {flattenFiles(files).map((f, i) => (
              <button
                key={i}
                onClick={() => handleMentionSelect(f)}
                style={{ display: 'block', width: '100%', padding: '4px 10px', background: 'transparent', border: 'none', borderBottom: '1px solid #1c2340', color: '#AEB6D8', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1c2340')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                📄 {f.name}
              </button>
            ))}
            {flattenFiles(files).length === 0 && (
              <div style={{ padding: '8px 10px', fontSize: 10, color: '#5A6080' }}>Nenhum arquivo aberto</div>
            )}
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: '#0f1428', border: '1px solid #1c2340', borderRadius: 10, padding: '8px 12px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva o que quer construir..."
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e8e8e8',
              fontFamily: 'monospace',
              fontSize: 13,
              resize: 'none',
              lineHeight: 1.5,
              minHeight: 40,
              maxHeight: 160,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isResponding}
            style={{
              background: input.trim() && !isResponding ? '#00ff88' : '#1c2340',
              color: input.trim() && !isResponding ? '#000' : '#5A6080',
              border: 'none',
              borderRadius: 6,
              width: 32,
              height: 32,
              cursor: input.trim() && !isResponding ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#3a4060' }}>
          <span>Enter · Shift+Enter nova linha · Claude Code</span>
        </div>
      </div>
    );
  }
}

// Helper: find file node by path
function findFileByPath(files: any[], path: string): any | null {
  for (const f of files) {
    if (f.path === path || f.name === path) return f;
    if (f.children) {
      const found = findFileByPath(f.children, path);
      if (found) return found;
    }
  }
  return null;
}

// Helper: flatten file tree to list of files
function flattenFiles(files: any[]): { id: string; name: string; content?: string }[] {
  const result: { id: string; name: string; content?: string }[] = [];
  for (const f of files) {
    if (f.type === 'file') result.push({ id: f.id, name: f.name, content: f.content });
    if (f.children) result.push(...flattenFiles(f.children));
  }
  return result;
}
