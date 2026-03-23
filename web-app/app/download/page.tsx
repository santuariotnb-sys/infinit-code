'use client';

import { useState } from 'react';

const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E")`;

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
    { num: '03', title: 'Primeira abertura', desc: 'Se aparecer "desenvolvedor não identificado", clique com botão direito → Abrir → Abrir. Isso acontece porque o app ainda não tem assinatura da Apple.', code: 'sudo xattr -rd com.apple.quarantine "/Applications/Infinit Code.app"' },
    { num: '04', title: 'Setup automático', desc: 'O app detecta e instala Node.js, Git, Claude Code e as Skills automaticamente. Só aguardar.' },
    { num: '05', green: true, title: 'Ativar a licença', desc: 'Cole a chave INFT-XXXX que chegou por email. Clique em "Ativar e entrar".' },
  ],
  win: [
    { num: '01', green: true, title: 'Baixar o .exe', desc: 'Clique em "Baixar para Windows". Arquivo: InfinitCode-1.0.0-Setup.exe' },
    { num: '02', title: 'Executar o instalador', desc: 'Duplo clique no .exe. Não precisa de permissão de administrador — instala para o usuário atual.' },
    { num: '03', green: true, title: 'Setup automático', desc: 'O app abre automaticamente após a instalação e cuida do resto.' },
  ],
  linux: [
    { num: '01', green: true, title: 'Baixar o .AppImage', desc: 'Clique em "Baixar para Linux". Funciona em qualquer distribuição.' },
    { num: '02', title: 'Dar permissão de execução', desc: '', code: 'chmod +x InfinitCode-1.0.0.AppImage' },
    { num: '03', green: true, title: 'Executar', desc: '', code: './InfinitCode-1.0.0.AppImage' },
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

          {/* OS Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>

            {/* macOS — featured */}
            <div className="os-card" style={{ ...glassStyle, background: 'rgba(255,255,255,0.72)', boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 1px 0 0 rgba(255,255,255,0.7) inset, 0 20px 60px rgba(0,0,0,0.1)', padding: '32px 28px', textAlign: 'center', cursor: 'pointer', transition: 'transform .2s', animation: 'fadeUp .5s ease both' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, background: '#3CB043', color: 'white', borderRadius: 6, padding: '3px 10px', fontSize: 10, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", zIndex: 2 }}>Recomendado</div>
              <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.7)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 4px 16px rgba(0,0,0,0.07)', fontSize: 28 }}>🍎</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#1a1c20', marginBottom: 6, letterSpacing: '-.01em' }}>macOS</div>
              <div style={{ fontSize: 13, color: '#8a8d96', fontWeight: 300, lineHeight: 1.5, marginBottom: 20 }}>Apple Silicon e Intel. macOS 12 Monterey ou superior.</div>
              <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>InfinitCode-<span style={{ color: '#8a8d96' }}>1.0.0</span>-arm64.dmg</div>
              <a href="#" className="btn-dl" style={{ width: '100%', background: '#3CB043', color: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 11, padding: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 20px rgba(60,176,67,0.25)', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, textDecoration: 'none' }}>
                <DownloadIcon /> Baixar para Mac
              </a>
              <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", marginTop: 10 }}>Intel: InfinitCode-1.0.0-x64.dmg</div>
            </div>

            {/* Windows */}
            <div className="os-card" style={{ ...glassStyle, padding: '32px 28px', textAlign: 'center', cursor: 'pointer', transition: 'transform .2s', animation: 'fadeUp .5s .08s ease both' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.7)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 4px 16px rgba(0,0,0,0.07)', fontSize: 28 }}>🪟</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#1a1c20', marginBottom: 6, letterSpacing: '-.01em' }}>Windows</div>
              <div style={{ fontSize: 13, color: '#8a8d96', fontWeight: 300, lineHeight: 1.5, marginBottom: 20 }}>Windows 10 e 11. 64-bit. Instalador NSIS sem precisar de admin.</div>
              <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>InfinitCode-<span style={{ color: '#8a8d96' }}>1.0.0</span>-Setup.exe</div>
              <a href="#" className="btn-dl" style={{ width: '100%', background: '#1a1c20', color: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 11, padding: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, textDecoration: 'none' }}>
                <DownloadIcon /> Baixar para Windows
              </a>
            </div>

            {/* Linux */}
            <div className="os-card" style={{ ...glassStyle, padding: '32px 28px', textAlign: 'center', cursor: 'pointer', transition: 'transform .2s', animation: 'fadeUp .5s .16s ease both' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.7)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 4px 16px rgba(0,0,0,0.07)', fontSize: 28 }}>🐧</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#1a1c20', marginBottom: 6, letterSpacing: '-.01em' }}>Linux</div>
              <div style={{ fontSize: 13, color: '#8a8d96', fontWeight: 300, lineHeight: 1.5, marginBottom: 20 }}>AppImage universal. Funciona no Ubuntu, Fedora, Arch e mais.</div>
              <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>InfinitCode-<span style={{ color: '#8a8d96' }}>1.0.0</span>.AppImage</div>
              <a href="#" className="btn-dl" style={{ width: '100%', background: '#1a1c20', color: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 11, padding: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, textDecoration: 'none' }}>
                <DownloadIcon /> Baixar para Linux
              </a>
              <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", marginTop: 10 }}>também: .deb para Ubuntu</div>
            </div>

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
            {['GitHub Releases', 'Changelog', 'Suporte'].map((l) => (
              <a key={l} href="#" className="foot-link" style={{ fontSize: 11, color: '#b0b3bc', textDecoration: 'none', transition: 'color .2s' }}>{l}</a>
            ))}
            <a href="/" className="foot-link" style={{ fontSize: 11, color: '#b0b3bc', textDecoration: 'none', transition: 'color .2s' }}>← Site</a>
          </div>
        </footer>

      </div>
    </>
  );
}
