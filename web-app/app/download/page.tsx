'use client';

import { useState, useEffect } from 'react';

const VERSION = '1.0.0';
const RELEASE_DATE = '2026-03-23';
const BASE = 'https://github.com/santuariotnb-sys/infinit-code-desktop/releases/download/v1.0.0';
const RELEASES = 'https://github.com/santuariotnb-sys/infinit-code-desktop/releases';

type OS = 'mac-arm' | 'mac-intel' | 'windows' | 'linux' | 'unknown';

function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  const platform = (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? '';
  if (/Mac/.test(platform) || /Mac/.test(ua)) {
    return /arm|Apple Silicon/i.test(ua) ? 'mac-arm' : 'mac-intel';
  }
  if (/Win/.test(platform) || /Windows/.test(ua)) return 'windows';
  if (/Linux/.test(platform) || /Linux/.test(ua)) return 'linux';
  return 'unknown';
}

const downloads = [
  {
    id: 'mac-arm' as OS,
    label: 'Download Mac',
    sublabel: 'Apple Silicon (M1/M2/M3)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    href: `${BASE}/Infinit.Code-${VERSION}-arm64.dmg`,
  },
  {
    id: 'mac-intel' as OS,
    label: 'Download Mac',
    sublabel: 'Intel (x64)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    href: `${BASE}/Infinit.Code-${VERSION}-arm64.dmg`,
  },
  {
    id: 'windows' as OS,
    label: 'Download Windows',
    sublabel: 'Windows 10/11 (x64)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 5.557l7.357-1.002.003 7.097-7.354.042L3 5.557zm7.354 6.913l.004 7.101-7.354-1.01v-6.14l7.35.049zm.892-8.046L21.001 3v8.562l-9.755.077V4.424zm9.758 8.113l-.003 8.516-9.755-1.37-.014-7.191 9.772.045z"/>
      </svg>
    ),
    href: `${BASE}/Infinit.Code-${VERSION}.Setup.exe`,
  },
  {
    id: 'linux' as OS,
    label: 'Download Linux',
    sublabel: 'Em breve',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489.117.779.567 1.563 1.182 2.114.206.182.368.368.498.548.064-.078.128-.154.188-.23.468-.595.955-1.174 1.458-1.741-.367-.267-.697-.611-.983-1.027-.57-.832-.691-1.904-.39-2.918.302-1.013.969-1.937 1.73-2.705.766-.77 1.607-1.428 2.316-2.13.706-.704 1.281-1.456 1.542-2.34.26-.885.167-1.984-.398-3.14-.108-.223-.237-.424-.372-.611C9.96 1.36 11.245.53 12.504 0z"/>
      </svg>
    ),
    href: RELEASES,
  },
];

const instructions: Record<string, { title: string; steps: string[] }> = {
  mac: {
    title: 'Instalação no Mac',
    steps: [
      'Abra o arquivo .dmg baixado',
      'Arraste "Infinit Code" para a pasta Applications',
      'Se aparecer aviso de segurança: clique com botão direito → Abrir',
      'Ou no Terminal: sudo xattr -rd com.apple.quarantine "/Applications/Infinit Code.app"',
    ],
  },
  windows: {
    title: 'Instalação no Windows',
    steps: [
      'Execute o arquivo .exe baixado',
      'Se o Windows Defender alertar, clique em "Mais informações" → "Executar assim mesmo"',
      'Siga o instalador e clique em Next',
      'O app será instalado e criará um atalho na área de trabalho',
    ],
  },
  linux: {
    title: 'Instalação no Linux',
    steps: [
      'Abra o terminal na pasta onde baixou o arquivo',
      'chmod +x Infinit-Code-*.AppImage',
      './Infinit-Code-*.AppImage',
      'Ou use o AppImageLauncher para integração com o sistema',
    ],
  },
};

export default function DownloadPage() {
  const [detectedOS, setDetectedOS] = useState<OS>('unknown');
  const [openInstructions, setOpenInstructions] = useState<string | null>(null);

  useEffect(() => {
    setDetectedOS(detectOS());
  }, []);

  const instructionKey =
    detectedOS === 'mac-arm' || detectedOS === 'mac-intel' ? 'mac' :
    detectedOS === 'windows' ? 'windows' :
    detectedOS === 'linux' ? 'linux' : null;

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28, color: '#00ff88', fontWeight: 700 }}>∞</span>
        <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.3px' }}>Infinit Code</span>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 40px 60px' }}>
        <div style={{
          display: 'inline-block',
          background: '#00ff8820',
          border: '1px solid #00ff8840',
          borderRadius: 20,
          padding: '4px 14px',
          fontSize: 13,
          color: '#00ff88',
          fontWeight: 600,
          marginBottom: 24,
          letterSpacing: '0.5px',
        }}>
          v{VERSION} · {RELEASE_DATE}
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px', lineHeight: 1.1 }}>
          Baixe o <span style={{ color: '#00ff88' }}>Infinit Code</span>
        </h1>
        <p style={{ fontSize: 20, color: '#888', margin: 0 }}>
          Disponível para Mac, Windows e Linux
        </p>
      </div>

      {/* Download buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
        padding: '0 40px 80px',
        maxWidth: 900,
        margin: '0 auto',
      }}>
        {downloads.map((dl) => {
          const isDetected = dl.id === detectedOS;
          return (
            <a
              key={dl.id}
              href={dl.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px 32px',
                borderRadius: 16,
                border: isDetected ? '2px solid #00ff88' : '2px solid #2a2a2a',
                background: isDetected ? '#00ff8810' : '#111',
                color: '#fff',
                textDecoration: 'none',
                minWidth: 260,
                flex: '1 1 260px',
                maxWidth: 380,
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {isDetected && (
                <div style={{
                  position: 'absolute',
                  top: -10,
                  left: 20,
                  background: '#00ff88',
                  color: '#000',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: 10,
                  letterSpacing: '0.5px',
                }}>
                  SEU SISTEMA
                </div>
              )}
              <span style={{ color: isDetected ? '#00ff88' : '#888' }}>{dl.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{dl.label}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{dl.sublabel}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 20, color: '#444' }}>↓</span>
            </a>
          );
        })}
      </div>

      {/* Instruções */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 40px 80px' }}>
        {(['mac', 'windows', 'linux'] as const).map((os) => {
          const info = instructions[os];
          const isOpen = openInstructions === os;
          const isDetectedGroup =
            (os === 'mac' && (detectedOS === 'mac-arm' || detectedOS === 'mac-intel')) ||
            os === detectedOS;

          return (
            <div key={os} style={{ borderBottom: '1px solid #1a1a1a' }}>
              <button
                onClick={() => setOpenInstructions(isOpen ? null : os)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: isDetectedGroup ? '#00ff88' : '#aaa',
                  fontSize: 15,
                  fontWeight: 600,
                  padding: '18px 0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {info.title}
                <span style={{ fontSize: 20, color: '#444' }}>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <ol style={{ margin: '0 0 20px', paddingLeft: 20, color: '#888', lineHeight: 2 }}>
                  {info.steps.map((step, i) => (
                    <li key={i} style={{ fontFamily: 'monospace', fontSize: 13 }}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #1a1a1a', color: '#444', fontSize: 13 }}>
        <a href={RELEASES} style={{ color: '#00ff88', textDecoration: 'none' }}>Ver changelog no GitHub →</a>
      </div>
    </main>
  );
}
