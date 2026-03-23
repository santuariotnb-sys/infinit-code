'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { MachineSession } from '@/lib/ide/machine-client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatPanelProps {
  machine: MachineSession | null;
  onStartTerminal?: () => void;
  sendCommand?: (cmd: string) => void;
  onOpenRepos?: () => void;
  onSyncFiles?: () => void;
}

const quickActions = [
  { icon: '⚡', title: 'Criar projeto', desc: 'Next.js, React, Node.js', prompt: 'Crie um projeto Next.js com TypeScript e Tailwind CSS' },
  { icon: '⑂', title: 'Clonar repo', desc: 'Clone do GitHub', action: 'clone' as const },
  { icon: '🔍', title: 'Analisar código', desc: 'Review e refactor', prompt: 'Analise o código do projeto atual e sugira melhorias' },
  { icon: '🐛', title: 'Corrigir bug', desc: 'Debug automático', prompt: 'Me ajude a encontrar e corrigir bugs no projeto' },
  { icon: '📦', title: 'Dependências', desc: 'npm install + config', prompt: 'Instale e configure as dependências necessárias' },
  { icon: '🚀', title: 'Deploy', desc: 'Vercel, Netlify, Fly', prompt: 'Configure o deploy do projeto' },
];

const suggestions = [
  'Crie uma landing page moderna com hero, features e pricing',
  'Configure Supabase com auth e banco de dados',
  'Adicione testes automatizados ao projeto',
  'Otimize o código para performance',
];

export function ChatPanel({ machine, onStartTerminal, sendCommand, onOpenRepos, onSyncFiles }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const addMsg = useCallback((role: 'user' | 'assistant', content: string, isLoading = false) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setMessages(prev => [...prev, { id, role, content, timestamp: new Date(), isLoading }]);
    return id;
  }, []);

  const updateMsg = useCallback((id: string, content: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content, isLoading: false } : m));
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isProcessing) return;
    setInput('');
    addMsg('user', text);

    if (!machine) {
      addMsg('assistant', '⚠️ Terminal não conectado. Clique **Conectar** acima para iniciar o ambiente.');
      return;
    }

    setIsProcessing(true);
    const lid = addMsg('assistant', '', true);

    if (sendCommand) {
      const escaped = text.replace(/'/g, "'\\''");
      sendCommand(`claude '${escaped}'`);
    }

    setTimeout(() => {
      updateMsg(lid, `Comando enviado ao terminal.\n\n\`\`\`\nclaude '${text}'\n\`\`\`\n\nAcompanhe na aba **Terminal**. Quando terminar, clique **Sync** para atualizar os arquivos no editor.`);
      setIsProcessing(false);
      // Auto-sync após delay (dá tempo pro Claude começar a trabalhar)
      if (onSyncFiles) {
        setTimeout(() => onSyncFiles(), 10000);
      }
    }, 800);
  }, [input, isProcessing, machine, sendCommand, addMsg, updateMsg, onSyncFiles]);

  const handleAction = useCallback((a: typeof quickActions[0]) => {
    if (a.action === 'clone') { onOpenRepos?.(); return; }
    if (a.prompt) { setInput(a.prompt); inputRef.current?.focus(); }
  }, [onOpenRepos]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach(f => {
      const r = new FileReader();
      r.onload = () => addMsg('user', `📎 **${f.name}** (${(f.size/1024).toFixed(1)}KB)\n\n\`\`\`\n${(r.result as string).slice(0, 2000)}\n\`\`\``);
      r.readAsText(f);
    });
    e.target.value = '';
  }, [addMsg]);

  const inputArea = (
    <div style={{ padding: '12px 16px', borderTop: '1px solid #1c2340', background: '#0b0f1e' }}>
      {!machine && onStartTerminal && (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, padding:'6px 10px', background:'rgba(241,196,15,.05)', border:'1px solid rgba(241,196,15,.1)', borderRadius:6, fontSize:11, color:'#f1c40f' }}>
          <span>⚠</span><span style={{flex:1}}>Terminal desconectado</span>
          <button onClick={onStartTerminal} style={{ background:'#f1c40f', color:'#000', border:'none', borderRadius:4, padding:'3px 10px', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'monospace' }}>Conectar →</button>
        </div>
      )}
      <div style={{ display:'flex', alignItems:'flex-end', gap:8, background:'#0f1428', border:'1px solid #1c2340', borderRadius:10, padding:'8px 12px' }}>
        <button onClick={() => fileInputRef.current?.click()} title="Anexar arquivo" style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:'#5A6080', fontSize:16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <input ref={fileInputRef} type="file" multiple style={{display:'none'}} onChange={onFile} accept=".ts,.tsx,.js,.jsx,.json,.html,.css,.md,.py,.sql,.txt" />
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} placeholder="Descreva o que quer construir..." rows={1}
          style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#e8e8e8', fontFamily:'monospace', fontSize:13, resize:'none', lineHeight:1.5, maxHeight:160 }} />
        <button onClick={handleSend} disabled={!input.trim()||isProcessing}
          style={{ background: input.trim()&&!isProcessing?'#00ff88':'#1c2340', color: input.trim()&&!isProcessing?'#000':'#5A6080', border:'none', borderRadius:6, width:32, height:32, cursor: input.trim()&&!isProcessing?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'#3a4060' }}>
        <span>Enter enviar · Shift+Enter nova linha</span>
        <span>Claude Code · sua conta</span>
      </div>
    </div>
  );

  // Welcome screen
  if (messages.length === 0) {
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0a0a0a', borderTop:'1px solid #1c2340', fontFamily:'monospace' }}>
        <div style={{ padding:'8px 16px', background:'#0f1428', borderBottom:'1px solid #1c2340', display:'flex', alignItems:'center', gap:8, fontSize:11, color:'#5A6080' }}>
          <span style={{color:'#00ff88',fontSize:14}}>∞</span><span>INFINIT CHAT</span>
          <span style={{ width:6,height:6,borderRadius:'50%',background:machine?'#3EEDB0':'#5A6080' }}/><span>{machine?'Conectado':'Desconectado'}</span>
        </div>
        <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:24 }}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:36,color:'#00ff88',marginBottom:8}}>∞</div>
            <h2 style={{fontSize:16,color:'#e8e8e8',margin:'0 0 4px',fontWeight:600}}>O que vamos construir?</h2>
            <p style={{fontSize:12,color:'#5A6080',margin:0}}>Claude Code integrado · Node.js 22 · Deploy automático</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:8, maxWidth:520, width:'100%' }}>
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => handleAction(a)}
                onMouseEnter={e => (e.currentTarget.style.borderColor='#2a3050')}
                onMouseLeave={e => (e.currentTarget.style.borderColor='#1c2340')}
                style={{ background:'#0f1428', border:'1px solid #1c2340', borderRadius:8, padding:'12px 10px', cursor:'pointer', textAlign:'left', fontFamily:'monospace', transition:'border-color .15s' }}>
                <div style={{fontSize:18,marginBottom:6}}>{a.icon}</div>
                <div style={{fontSize:11,color:'#e8e8e8',fontWeight:600,marginBottom:2}}>{a.title}</div>
                <div style={{fontSize:10,color:'#5A6080'}}>{a.desc}</div>
              </button>
            ))}
          </div>
          <div style={{maxWidth:520,width:'100%'}}>
            <div style={{fontSize:10,color:'#5A6080',marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Sugestões</div>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                onMouseEnter={e => (e.currentTarget.style.background='#0f1428')}
                onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                style={{ display:'block', width:'100%', background:'transparent', border:'1px solid #1c2340', borderRadius:6, padding:'8px 12px', cursor:'pointer', textAlign:'left', fontFamily:'monospace', fontSize:11, color:'#AEB6D8', marginBottom:4, transition:'background .15s' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        {inputArea}
      </div>
    );
  }

  // Chat messages view
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#0a0a0a', borderTop:'1px solid #1c2340', fontFamily:'monospace' }}>
      <div style={{ padding:'8px 16px', background:'#0f1428', borderBottom:'1px solid #1c2340', display:'flex', alignItems:'center', gap:8, fontSize:11, color:'#5A6080' }}>
        <span style={{color:'#00ff88',fontSize:14}}>∞</span><span>INFINIT CHAT</span>
        <span style={{ width:6,height:6,borderRadius:'50%',background:machine?'#3EEDB0':'#5A6080' }}/><span>{machine?'Conectado':'Desconectado'}</span>
        <div style={{flex:1}}/>
        <button onClick={() => setMessages([])} style={{ background:'none', border:'1px solid #1c2340', borderRadius:3, color:'#5A6080', fontSize:10, padding:'2px 8px', cursor:'pointer', fontFamily:'monospace' }}>Nova conversa</button>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:16 }}>
        {messages.map(msg => <MsgBubble key={msg.id} msg={msg} />)}
        <div ref={messagesEndRef} />
      </div>
      {inputArea}
    </div>
  );
}

function MsgBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  if (msg.isLoading) {
    return (
      <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
        <div style={{ width:24,height:24,borderRadius:6,background:'rgba(0,255,136,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#00ff88',flexShrink:0 }}>∞</div>
        <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#5A6080' }}>
          <div style={{ width:8,height:8,border:'1.5px solid #1c2340',borderTopColor:'#00ff88',borderRadius:'50%',animation:'spin 1s linear infinite' }}/>
          Processando...
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }
  // Simple markdown: **bold**, `code`, ```blocks```
  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith('```') && p.endsWith('```')) {
        return <pre key={i} style={{ background:'#080c1a', border:'1px solid #1c2340', borderRadius:6, padding:'8px 12px', margin:'8px 0', overflow:'auto', fontSize:11, color:'#AEB6D8' }}>{p.slice(3,-3).replace(/^\w+\n/,'')}</pre>;
      }
      if (p.startsWith('`') && p.endsWith('`')) {
        return <code key={i} style={{ background:'#0f1428', padding:'1px 5px', borderRadius:3, fontSize:11, color:'#3EEDB0' }}>{p.slice(1,-1)}</code>;
      }
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={i} style={{color:'#e8e8e8'}}>{p.slice(2,-2)}</strong>;
      }
      return <span key={i}>{p}</span>;
    });
  };

  return (
    <div style={{ display:'flex', gap:8, alignItems:'flex-start', flexDirection: isUser?'row-reverse':'row' }}>
      <div style={{ width:24,height:24,borderRadius:6, background:isUser?'rgba(91,108,249,.1)':'rgba(0,255,136,.1)', display:'flex',alignItems:'center',justifyContent:'center', fontSize:11,flexShrink:0, color:isUser?'#5B6CF9':'#00ff88', fontWeight:700 }}>
        {isUser ? '→' : '∞'}
      </div>
      <div style={{ maxWidth:'80%', padding:'10px 14px', borderRadius:isUser?'12px 12px 4px 12px':'12px 12px 12px 4px', background:isUser?'rgba(91,108,249,.08)':'#0f1428', border:`1px solid ${isUser?'rgba(91,108,249,.15)':'#1c2340'}`, fontSize:12, color:'#e8e8e8', lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
        {renderContent(msg.content)}
      </div>
    </div>
  );
}
