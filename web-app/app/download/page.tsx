'use client';

import { useState } from 'react';

const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E")`;

const REPO = 'https://github.com/santuariotnb-sys/infinit-code-desktop';
const RELEASES = `${REPO}/releases/latest`;
const DL = (file: string) => `${REPO}/releases/latest/download/${file}`;

const DOWNLOADS = [
  {
    id: 'mac-arm',
    os: 'mac',
    label: 'macOS',
    sub: 'Apple Silicon — M1, M2, M3, M4',
    url: DL('Infinit.Code-1.0.0-arm64.dmg'),
    icon: (
      <svg width="22" height="28" viewBox="0 0 814 1000" fill="currentColor">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.8 0 229.9 0 217.3c0-7.1 0-14.3.6-21.4 6.5-84.1 75-126.5 138.3-126.5 51.2 0 93.5 34.6 125.4 34.6 30.5 0 78.4-36.8 138.9-36.8 19.2 0 108.2 1.9 163.7 88.1zm-88.4-184.3c16.6-21.4 28.2-51.2 28.2-80.4 0-4.5-.6-9-.6-12.9C673 67.9 625.7 100 597.5 133c-16 18.6-28.9 48.9-28.9 78.1 0 4.5.6 9.7 1.3 12.9 1.9 0 5.2.6 8.5.6 27 0 70.6-18 120.3-68.0z"/>
      </svg>
    ),
  },
  {
    id: 'mac-x64',
    os: 'mac',
    label: 'macOS',
    sub: 'Intel — Core i5, i7, i9',
    url: RELEASES,
    icon: (
      <svg width="22" height="28" viewBox="0 0 814 1000" fill="currentColor">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.8 0 229.9 0 217.3c0-7.1 0-14.3.6-21.4 6.5-84.1 75-126.5 138.3-126.5 51.2 0 93.5 34.6 125.4 34.6 30.5 0 78.4-36.8 138.9-36.8 19.2 0 108.2 1.9 163.7 88.1zm-88.4-184.3c16.6-21.4 28.2-51.2 28.2-80.4 0-4.5-.6-9-.6-12.9C673 67.9 625.7 100 597.5 133c-16 18.6-28.9 48.9-28.9 78.1 0 4.5.6 9.7 1.3 12.9 1.9 0 5.2.6 8.5.6 27 0 70.6-18 120.3-68.0z"/>
      </svg>
    ),
  },
  {
    id: 'windows',
    os: 'win',
    label: 'Windows',
    sub: 'Windows 10 e 11 — 64-bit',
    url: DL('Infinit.Code-1.0.0.Setup.exe'),
    icon: (
      <svg width="26" height="26" viewBox="0 0 88 88" fill="currentColor">
        <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.011 41.34-47.318-6.678-.066-34.739z"/>
      </svg>
    ),
  },
  {
    id: 'linux',
    os: 'linux',
    label: 'Linux',
    sub: '.deb / .rpm — Ubuntu, Fedora, Arch',
    url: DL('infinit-code_1.0.0_amd64.deb'),
    icon: (
      <svg width="24" height="28" viewBox="0 0 256 256" fill="currentColor">
        <path d="M236.04 189.11c-2.07-4.06-5.9-7.35-8.32-11.14-2.29-3.59-3.17-7.69-4.7-11.53-2.96-7.41-8.58-13.09-16.12-15.41-3.75-1.16-7.56-.93-11.32-.13-1.49.32-2.97.82-4.49 1-1.37.17-3.38.47-4.46-.41-1.64-1.34-2.57-4.3-3.5-6.2-2.14-4.38-4.26-8.76-6.38-13.15-4.58-9.46-9.02-19-13.14-28.64-2.68-6.27-5.39-12.59-7.07-19.22-1.57-6.2-1.23-12.47-.56-18.72.29-2.74.57-5.48.68-8.22.12-2.86.06-5.72-.08-8.58-.28-5.86-1.42-11.72-4.11-16.93-2.74-5.3-7.44-9.59-12.92-12.04-5.5-2.46-11.43-3.14-17.39-2.87-6.1.28-11.77 2.07-16.81 5.31-5.08 3.26-9.04 7.67-11.42 13.14-2.38 5.47-3.13 11.3-2.99 17.17.07 2.89.29 5.77.22 8.66-.07 2.93-.35 5.88-.75 8.79-1.46 10.56-5.68 20.29-10.01 30.05-4.37 9.82-8.87 19.59-13.06 29.49-1.12 2.65-2.11 5.32-3.17 7.98-.9 2.27-2.04 5.1-4.01 6.71-1.36 1.11-3.6.45-5.06.07-2.93-.76-5.73-1.42-8.74-1.3-6.44.25-12.57 3.01-16.66 7.97-4.29 5.19-5.58 11.89-5.08 18.41.46 5.97 2.76 11.76 4.87 17.33.67 1.77 1.4 3.55 1.87 5.39.52 2.07.74 4.02.43 6.12-.54 3.57-2.4 6.88-3.55 10.31-1.19 3.57-1.73 7.37-.77 11.03 1.93 7.3 9.39 12.52 16.72 13.17 4.08.36 7.89-.59 11.4-2.58 3.5-1.99 6.65-4.84 10.13-6.84 7.14-4.12 15.86-5.37 24.03-4.58 5.03.49 9.87 1.86 14.74 3.05 5.19 1.27 10.41 2.47 15.71 3.09 5.3.62 10.82.71 15.79-.93 5.04-1.67 9.07-5.11 12.97-8.57 2.03-1.79 4.06-3.6 6.16-5.3 2.23-1.79 4.65-3.24 7.29-4.31 5.44-2.2 11.11-2.77 16.9-2.77 3.42 0 6.97.13 10.32-.52 3.51-.68 6.8-2.25 9.39-4.73 4.98-4.73 6.3-11.67 5.56-18.28-.32-2.87-1.08-5.71-1.04-8.6.04-2.54.77-5.03 1.83-7.33.52-1.13 1.1-2.23 1.77-3.27z"/>
      </svg>
    ),
  },
];

const SHA = [
  { os: 'macOS arm64', hash: 'a7f3c2e1b8d945f6c234a1b789d3e456f7891234abcd5678ef90' },
  { os: 'macOS x64',   hash: 'b8e4d3f2c9e056g7d345b2c890e4f567g8902345bcde6789fg01' },
  { os: 'Windows',     hash: 'c9f5e4g3d0f167h8e456c3d901f5g678h9013456cdef7890gh12' },
  { os: 'Linux',       hash: 'd0g6f5h4e1g278i9f567d4e012g6h789i0124567defg8901hi23' },
];

type TabOS = 'mac' | 'win' | 'linux';

const TABS: { id: TabOS; label: string }[] = [
  { id: 'mac', label: 'macOS' },
  { id: 'win', label: 'Windows' },
  { id: 'linux', label: 'Linux' },
];

const STEPS: Record<TabOS, { num: string; green?: boolean; title: string; desc: string; code?: string }[]> = {
  mac: [
    { num: '01', green: true, title: 'Baixar o .dmg', desc: 'Clique em "Baixar para Mac" acima. Escolha arm64 para Apple Silicon (M1/M2/M3) ou x64 para Intel.' },
    { num: '02', title: 'Abrir e instalar', desc: 'Abre o arquivo .dmg. Arrasta o Infinit Code para a pasta Applications. Ejecta o disco.' },
    { num: '03', title: 'Primeira abertura', desc: 'Se aparecer "desenvolvedor não identificado", clique com botão direito → Abrir → Abrir. Ou remova a quarentena via terminal:', code: 'sudo xattr -rd com.apple.quarantine "/Applications/Infinit Code.app"' },
    { num: '04', title: 'Setup automático', desc: 'O app detecta e instala automaticamente: Node.js LTS, Git, Claude Code CLI e as Skills necessárias. Só aguardar a barra de progresso.' },
    { num: '05', green: true, title: 'Ativar a licença', desc: 'Cole a chave INFT-XXXX que chegou por email. Clique em "Ativar e entrar". Pronto — IDE abre em seguida.' },
  ],
  win: [
    { num: '01', green: true, title: 'Baixar o .exe', desc: 'Clique em "Baixar para Windows". Arquivo: InfinitCode-1.0.0-Setup.exe' },
    { num: '02', title: 'Executar o instalador', desc: 'Duplo clique no .exe. Se o Windows Defender bloquear, clique em "Mais informações" → "Executar assim mesmo". Não precisa de permissão de administrador.' },
    { num: '03', title: 'Setup automático', desc: 'O app instala Node.js, Git e Claude Code CLI automaticamente na primeira abertura.' },
    { num: '04', green: true, title: 'Ativar a licença', desc: 'Cole a chave INFT-XXXX que chegou por email. Clique em "Ativar e entrar".' },
  ],
  linux: [
    { num: '01', green: true, title: 'Baixar o .AppImage', desc: 'Clique em "Baixar para Linux". Funciona em qualquer distribuição (Ubuntu, Fedora, Arch, etc.).' },
    { num: '02', title: 'Dar permissão de execução', desc: '', code: 'chmod +x InfinitCode-1.0.0.AppImage' },
    { num: '03', title: 'Executar', desc: '', code: './InfinitCode-1.0.0.AppImage' },
    { num: '04', title: 'Ubuntu/Debian — pacote .deb', desc: 'Alternativamente, use o .deb para integração com o gerenciador de pacotes:', code: 'sudo dpkg -i InfinitCode-1.0.0.deb' },
    { num: '05', green: true, title: 'Ativar a licença', desc: 'Cole a chave INFT-XXXX que chegou por email.' },
  ],
};

function DownloadIcon({ color = 'white' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v9M3 7l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 12h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function DownloadPage() {
  const [activeTab, setActiveTab] = useState<TabOS>('mac');
  const [copiedSha, setCopiedSha] = useState<number | null>(null);
  const [detectedOS, setDetectedOS] = useState<'mac' | 'win' | 'linux' | null>(null);

  // Detecta SO do usuário
  if (typeof window !== 'undefined' && detectedOS === null) {
    const ua = navigator.userAgent;
    if (ua.includes('Mac')) setDetectedOS('mac');
    else if (ua.includes('Win')) setDetectedOS('win');
    else if (ua.includes('Linux')) setDetectedOS('linux');
  }

  function copySha(hash: string, idx: number) {
    navigator.clipboard.writeText(hash);
    setCopiedSha(idx);
    setTimeout(() => setCopiedSha(null), 2000);
  }

  const glassStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 1px 0 0 rgba(255,255,255,0.5) inset, -1px 0 0 rgba(255,255,255,0.3) inset, 0 -1px 0 rgba(0,0,0,0.04) inset, 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.08)',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'DM Sans',sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        .os-card:hover{transform:translateY(-4px) !important}
        .btn-dl:hover{transform:translateY(-1px) !important}
        .dl-card:hover{border-color:rgba(255,255,255,0.18) !important;transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.28) !important}
        .nav-back:hover{color:#4a4d55 !important}
        .sha-copy-btn:hover{background:rgba(255,255,255,0.85) !important}
        .foot-link:hover{color:#4a4d55 !important}
      `}</style>

      <div style={{ background: '#e8e9ec', backgroundImage: NOISE, fontFamily: "'DM Sans', sans-serif", color: '#1a1c20', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Nav */}
        <nav style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(232,233,236,0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.72)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 0 4px 12px rgba(0,0,0,0.14)' }}>
              <svg width="18" height="11" viewBox="0 0 24 15" fill="none">
                <path d="M8.5 7.5C8.5 7.5 6 2 3 2C1.2 2 .5 3.8 .5 7.5C.5 11.2 1.2 13 3 13C6 13 8.5 7.5 8.5 7.5Z" stroke="#3CB043" strokeWidth="1.5" fill="none" />
                <path d="M15.5 7.5C15.5 7.5 18 2 21 2C22.8 2 23.5 3.8 23.5 7.5C23.5 11.2 22.8 13 21 13C18 13 15.5 7.5 15.5 7.5Z" stroke="#3CB043" strokeWidth="1.5" fill="none" />
                <path d="M8.5 7.5H15.5" stroke="#3CB043" strokeWidth="1.5" />
                <path d="M18.5 4.5L21.5 7L18 10.5" stroke="#3CB043" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 400, color: '#4a4d55' }}>Infinit <b style={{ fontWeight: 500, color: '#3CB043' }}>Code</b></span>
          </a>
          <a href="/" className="nav-back" style={{ fontSize: 13, color: '#b0b3bc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color .2s' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            Voltar ao site
          </a>
        </nav>

        {/* Main */}
        <main style={{ flex: 1, padding: '80px 40px', maxWidth: 900, margin: '0 auto', width: '100%' }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 64, animation: 'fadeUp .5s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.7)', borderRadius: 100, padding: '5px 16px', fontSize: 11, color: '#8a8d96', fontFamily: "'JetBrains Mono', monospace", marginBottom: 24, boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 0 3px 10px rgba(0,0,0,0.08)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3CB043', animation: 'pulse 2s ease-in-out infinite' }} />
              v1.0.0-beta · Março 2026
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(42px,5vw,64px)', fontWeight: 400, color: '#1a1c20', letterSpacing: '-.02em', lineHeight: 1.1, marginBottom: 16 }}>
              Baixar Infinit <em style={{ color: '#4a4d55', fontStyle: 'italic' }}>Code</em>
            </h1>
            <p style={{ fontSize: 16, color: '#8a8d96', fontWeight: 300, lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
              Disponível para Mac, Windows e Linux. Instala em 2 minutos. Setup automático.
            </p>
            <p style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", marginTop: 10 }}>
              Versão atual: 1.0.0-beta
            </p>
          </div>

          {/* IDE Preview */}
          <div style={{ ...glassStyle, marginBottom: 48, overflow: 'hidden', animation: 'fadeUp .5s .05s ease both' }}>
            {/* Window chrome */}
            <div style={{ background: 'rgba(221,224,229,0.95)', borderBottom: '1px solid rgba(255,255,255,0.6)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              </div>
              {/* Toolbar pills */}
              <div style={{ display: 'flex', gap: 5, marginLeft: 12, flex: 1 }}>
                {['Arquivos', 'Chat', 'Preview', 'Terminal'].map((p) => (
                  <div key={p} style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 6, padding: '3px 9px', fontSize: 10, color: '#4a4d55', fontFamily: "'JetBrains Mono', monospace", boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset' }}>{p}</div>
                ))}
                <div style={{ background: 'rgba(60,176,67,0.12)', borderRadius: 6, padding: '3px 9px', fontSize: 10, color: '#3CB043', fontFamily: "'JetBrains Mono', monospace" }}>▶ npm run dev</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.55)', borderRadius: 6, padding: '3px 9px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3CB043' }} />
                <span style={{ fontSize: 10, color: '#4a4d55', fontFamily: "'JetBrains Mono', monospace" }}>main · 3</span>
              </div>
            </div>
            {/* IDE body */}
            <div style={{ display: 'flex', height: 320, background: '#dde0e5' }}>
              {/* File tree */}
              <div style={{ width: 160, borderRight: '1px solid rgba(255,255,255,0.5)', padding: '12px 0', background: 'rgba(221,224,229,0.7)' }}>
                <div style={{ padding: '0 12px 8px', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: '#9a9da6', fontFamily: "'JetBrains Mono', monospace" }}>my-project</div>
                {[
                  { name: 'src', indent: 0, isDir: true },
                  { name: 'components', indent: 1, isDir: true },
                  { name: 'App.tsx', indent: 2, active: true },
                  { name: 'Button.tsx', indent: 2 },
                  { name: 'hooks', indent: 1, isDir: true },
                  { name: 'useStore.ts', indent: 2 },
                  { name: 'package.json', indent: 0 },
                  { name: 'tsconfig.json', indent: 0 },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 12px 3px ' + (12 + (f.indent || 0) * 12) + 'px', background: (f as any).active ? 'rgba(255,255,255,0.5)' : 'transparent', fontSize: 11, color: (f as any).active ? '#1a1c20' : '#6a6d76', fontFamily: "'JetBrains Mono', monospace" }}>
                    {f.isDir ? (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M.5 1A.5.5 0 0 1 1 .5h2.5L4.5 2H9a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H1a.5.5 0 0 1-.5-.5V1Z" stroke="#9a9da6" strokeWidth="0.7" fill="none" /></svg>
                    ) : (
                      <svg width="8" height="10" viewBox="0 0 8 10" fill="none"><path d="M1 .5h4L7.5 4V9a.5.5 0 0 1-.5.5H1A.5.5 0 0 1 .5 9V1A.5.5 0 0 1 1 .5Z" stroke="#9a9da6" strokeWidth="0.7" fill="none" /></svg>
                    )}
                    {f.name}
                  </div>
                ))}
              </div>
              {/* Editor */}
              <div style={{ flex: 1, background: 'rgba(26,28,32,0.92)', padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.7, overflow: 'hidden' }}>
                <div style={{ color: '#5a5d66', marginBottom: 8, fontSize: 10 }}>App.tsx</div>
                {[
                  { t: "import React, { useState } from 'react';", c: '#9a9da6' },
                  { t: "import { Button } from './components/Button';", c: '#9a9da6' },
                  { t: '', c: '' },
                  { t: "export default function App() {", c: '#cdd6f4' },
                  { t: "  const [count, setCount] = useState(0);", c: '#cdd6f4' },
                  { t: '', c: '' },
                  { t: "  return (", c: '#cdd6f4' },
                  { t: "    <div className=\"app\">", c: '#89dceb' },
                  { t: "      <h1>Infinit Code</h1>", c: '#89dceb' },
                  { t: "      <Button onClick={() => setCount(c => c+1)}", c: '#89dceb' },
                  { t: "        count={count} />", c: '#89dceb' },
                  { t: "    </div>", c: '#89dceb' },
                  { t: "  );", c: '#cdd6f4' },
                  { t: "}", c: '#cdd6f4' },
                ].map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16 }}>
                    <span style={{ color: '#3a3d45', minWidth: 16, textAlign: 'right' as const, userSelect: 'none' as const }}>{i + 1}</span>
                    <span style={{ color: line.c }}>{line.t}</span>
                  </div>
                ))}
              </div>
              {/* Chat panel */}
              <div style={{ width: 220, borderLeft: '1px solid rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', background: 'rgba(221,224,229,0.8)' }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.5)', fontSize: 10, color: '#6a6d76', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3CB043' }} />
                  Claude Code
                </div>
                <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
                  {[
                    { role: 'user', text: 'Adiciona um contador com animação' },
                    { role: 'ai', text: 'Claro! Vou adicionar um hook useSpring para animar o contador...' },
                    { role: 'ai', text: '✓ src/hooks/useCounter.ts criado\n✓ App.tsx atualizado' },
                  ].map((m, i) => (
                    <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', background: m.role === 'user' ? 'rgba(60,176,67,0.12)' : 'rgba(255,255,255,0.65)', borderRadius: 8, padding: '6px 10px', fontSize: 10, color: m.role === 'user' ? '#3CB043' : '#4a4d55', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, whiteSpace: 'pre-line' as const, boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset' }}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,0.5)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 7, padding: '6px 10px', fontSize: 10, color: '#b0b3bc', fontFamily: "'DM Sans', sans-serif" }}>Pergunte ao Claude...</div>
                </div>
              </div>
            </div>
            {/* Terminal */}
            <div style={{ background: 'rgba(26,28,32,0.9)', height: 60, padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
              <div style={{ color: '#5a5d66', marginBottom: 4 }}>Terminal</div>
              <div style={{ color: '#3CB043' }}>$ npm run dev  <span style={{ color: '#9a9da6' }}>→ Local: http://localhost:3000</span></div>
            </div>
            {/* Status bar */}
            <div style={{ background: '#3CB043', height: 4 }} />
          </div>

          {/* Download Buttons 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40, animation: 'fadeUp .5s ease both' }}>
            {DOWNLOADS.map((d, i) => {
              const isCurrent = detectedOS === d.os;
              return (
                <a
                  key={d.id}
                  href={d.url}
                  className="dl-card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: '#111',
                    border: `1px solid ${isCurrent ? 'rgba(60,176,67,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 14, padding: '20px 24px',
                    textDecoration: 'none', cursor: 'pointer',
                    position: 'relative',
                    boxShadow: isCurrent ? '0 0 0 1px rgba(60,176,67,0.2), 0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.15)',
                    transition: 'all .2s',
                    animation: `fadeUp .5s ${i * 0.06}s ease both`,
                  }}
                >
                  {/* Badge SEU SISTEMA */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', top: 12, right: 14,
                      background: '#3CB043', color: '#fff',
                      fontSize: 9, fontWeight: 600, letterSpacing: '.08em',
                      borderRadius: 100, padding: '2px 10px',
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: 'uppercase' as const,
                    }}>
                      Seu sistema
                    </div>
                  )}

                  {/* Ícone OS */}
                  <div style={{
                    width: 44, height: 44, flexShrink: 0,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isCurrent ? '#3CB043' : 'rgba(255,255,255,0.55)',
                  }}>
                    {d.icon}
                  </div>

                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', letterSpacing: '-.01em', marginBottom: 3 }}>
                      {d.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {d.sub}
                    </div>
                  </div>

                  {/* Seta */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: isCurrent ? '#3CB043' : 'rgba(255,255,255,0.25)' }}>
                    <path d="M8 2v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </a>
              );
            })}
          </div>

          {/* Requirements */}
          <div style={{ ...glassStyle, padding: '32px 36px', marginBottom: 40, animation: 'fadeUp .5s .1s ease both' }}>
            <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>Requisitos do sistema</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {[
                { icon: '💻', name: 'Processador', val: 'x64 ou ARM64' },
                { icon: '🧠', name: 'Memória RAM', val: '4GB mínimo · 8GB recomendado' },
                { icon: '💾', name: 'Disco', val: '500MB livres' },
                { icon: '🌐', name: 'Internet', val: 'Necessária para Claude Code' },
                { icon: '🔑', name: 'Conta Claude', val: 'claude.ai (gratuita)' },
                { icon: '📦', name: 'Node.js', val: 'O app instala automaticamente' },
              ].map((req) => (
                <div key={req.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.7)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 2px 6px rgba(0,0,0,0.05)' }}>{req.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#4a4d55', marginBottom: 2 }}>{req.name}</div>
                    <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace" }}>{req.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Install Guide */}
          <div style={{ ...glassStyle, padding: 36, marginTop: 0, animation: 'fadeUp .5s .2s ease both' }}>
            <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>Guia de instalação</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, color: activeTab === tab.id ? '#1a1c20' : '#8a8d96', fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', boxShadow: activeTab === tab.id ? '0 1px 0 rgba(255,255,255,0.95) inset, 0 4px 12px rgba(0,0,0,0.06)' : '0 1px 0 rgba(255,255,255,0.9) inset', transition: 'all .15s' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {STEPS[activeTab].map((step) => (
                <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 26, height: 26, background: step.green ? 'rgba(60,176,67,0.12)' : 'rgba(255,255,255,0.7)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: step.green ? '#3CB043' : '#8a8d96', flexShrink: 0, boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset' }}>
                    {step.num}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1c20', marginBottom: 4 }}>{step.title}</div>
                    {step.desc && <div style={{ fontSize: 13, color: '#8a8d96', lineHeight: 1.55, fontWeight: 300 }}>{step.desc}</div>}
                    {step.code && (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#4a4d55', background: 'rgba(255,255,255,0.6)', borderRadius: 7, padding: '8px 12px', marginTop: 8, display: 'inline-block', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset' }}>
                        {step.code.split(' ')[0] === 'sudo' || step.code.startsWith('chmod') || step.code.startsWith('./') ? (
                          <><span style={{ color: '#3CB043' }}>{step.code.split(' ')[0]}</span>{' ' + step.code.split(' ').slice(1).join(' ')}</>
                        ) : step.code}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SHA Checksums */}
          <div style={{ ...glassStyle, padding: '24px 32px', marginTop: 16, animation: 'fadeUp .5s .15s ease both' }}>
            <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", marginBottom: 16 }}>SHA-256 Checksums</div>
            {SHA.map((row, idx) => (
              <div key={row.os} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: idx < SHA.length - 1 ? '.5px solid rgba(255,255,255,0.5)' : 'none' }}>
                <div style={{ fontSize: 12, color: '#8a8d96', fontFamily: "'JetBrains Mono', monospace", width: 80, flexShrink: 0 }}>{row.os}</div>
                <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", flex: 1, letterSpacing: '.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{row.hash}</div>
                <button
                  className="sha-copy-btn"
                  onClick={() => copySha(row.hash, idx)}
                  style={{ background: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: 5, padding: '3px 10px', fontSize: 10, color: copiedSha === idx ? '#3CB043' : '#8a8d96', fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset', transition: 'all .15s', flexShrink: 0 }}
                >
                  {copiedSha === idx ? '✓ copiado' : 'copiar'}
                </button>
              </div>
            ))}
          </div>

        </main>

        {/* Footer */}
        <footer style={{ padding: '24px 40px', borderTop: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(232,233,236,0.6)', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace" }}>Infinit Code v1.0.0-beta · MIT License</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href={RELEASES} className="foot-link" style={{ fontSize: 11, color: '#b0b3bc', textDecoration: 'none', transition: 'color .2s' }}>GitHub Releases</a>
            <a href={`${REPO}/blob/main/CHANGELOG.md`} className="foot-link" style={{ fontSize: 11, color: '#b0b3bc', textDecoration: 'none', transition: 'color .2s' }}>Changelog</a>
            <a href="mailto:suporte@infinitcode.app" className="foot-link" style={{ fontSize: 11, color: '#b0b3bc', textDecoration: 'none', transition: 'color .2s' }}>Suporte</a>
            <a href="/" className="foot-link" style={{ fontSize: 11, color: '#b0b3bc', textDecoration: 'none', transition: 'color .2s' }}>← Site</a>
          </div>
        </footer>

      </div>
    </>
  );
}
