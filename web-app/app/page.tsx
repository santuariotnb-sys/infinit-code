'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleCTA = () => {
    router.push(session ? '/ide' : '/auth/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e8e8e8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        :root {
          --primary: #00ff88;
          --accent: #5B6CF9;
          --bg: #050510;
          --surface: #0a0f1e;
          --border: rgba(91, 108, 249, 0.15);
          --glow-primary: rgba(0, 255, 136, 0.4);
          --glow-accent: rgba(91, 108, 249, 0.4);
          --text-primary: #e8e8e8;
          --text-muted: #6b7194;
          --font-display: 'JetBrains Mono', monospace;
          --font-body: 'Space Grotesk', sans-serif;
        }

        * { box-sizing: border-box; }

        .grid-bg {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image:
            linear-gradient(rgba(91, 108, 249, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91, 108, 249, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb-1 {
          position: fixed;
          width: 600px; height: 600px;
          top: -200px; right: -100px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          animation: orbFloat 8s ease-in-out infinite;
        }

        .glow-orb-2 {
          position: fixed;
          width: 500px; height: 500px;
          bottom: -100px; left: -100px;
          background: radial-gradient(circle, rgba(91, 108, 249, 0.1) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          animation: orbFloat 10s ease-in-out infinite reverse;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.1); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px var(--glow-primary), 0 0 60px rgba(0, 255, 136, 0.1); }
          50% { box-shadow: 0 0 30px var(--glow-primary), 0 0 80px rgba(0, 255, 136, 0.2); }
        }

        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .nav-glass {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px clamp(16px, 4vw, 40px);
          background: rgba(5, 5, 16, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .nav-logo {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 3px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-logo-symbol {
          font-size: 22px;
          text-shadow: 0 0 20px var(--glow-primary);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-link {
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.5px;
        }

        .nav-link:hover { color: var(--primary); }

        .btn-primary {
          background: var(--primary);
          color: #000;
          border: none;
          border-radius: 8px;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font-display);
          letter-spacing: 1px;
          transition: all 0.3s;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
        }

        .btn-primary:hover {
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
          transform: translateY(-1px);
        }

        .btn-outline {
          background: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 32px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: var(--font-body);
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: all 0.3s;
        }

        .btn-outline:hover {
          border-color: var(--accent);
          color: var(--text-primary);
          box-shadow: 0 0 20px var(--glow-accent);
        }

        .hero {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: clamp(60px, 12vw, 120px) 20px clamp(40px, 8vw, 80px);
          max-width: 860px;
          margin: 0 auto;
          z-index: 1;
        }

        .hero-badge {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 500;
          color: var(--primary);
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 28px;
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.12);
          border-radius: 30px;
          padding: 8px 20px;
          backdrop-filter: blur(10px);
          animation: fadeInUp 0.6s ease-out;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 7vw, 56px);
          font-weight: 800;
          margin: 0 0 24px;
          line-height: 1.05;
          letter-spacing: -2px;
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }

        .hero-title-gradient {
          background: linear-gradient(135deg, var(--primary) 0%, #3EEDB0 50%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-family: var(--font-body);
          font-size: 17px;
          color: var(--text-muted);
          line-height: 1.7;
          margin: 0 0 44px;
          max-width: 520px;
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }

        .btn-hero {
          background: linear-gradient(135deg, var(--primary), #3EEDB0);
          color: #000;
          border: none;
          border-radius: 10px;
          padding: 16px 36px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font-display);
          letter-spacing: 0.5px;
          transition: all 0.3s;
          animation: pulseGlow 3s ease-in-out infinite;
        }

        .btn-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px var(--glow-primary), 0 0 80px rgba(0, 255, 136, 0.15);
        }

        /* IDE Mockup */
        .ide-section {
          max-width: 960px;
          margin: 0 auto 120px;
          padding: 0 24px;
          position: relative;
          z-index: 1;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .ide-mockup {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 0 40px rgba(91, 108, 249, 0.08),
            0 20px 60px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .ide-titlebar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          background: rgba(10, 15, 30, 0.8);
          border-bottom: 1px solid var(--border);
        }

        .ide-dot {
          width: 11px; height: 11px;
          border-radius: 50%;
        }

        .ide-titlebar-text {
          flex: 1;
          text-align: center;
          font-family: var(--font-display);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 2px;
        }

        .ide-body {
          display: flex;
          height: clamp(220px, 42vw, 340px);
        }

        .ide-explorer {
          width: 190px;
          border-right: 1px solid var(--border);
          padding: 14px 0;
          font-family: var(--font-display);
          font-size: 11px;
          color: var(--text-muted);
        }

        .ide-explorer-item {
          padding: 4px 16px;
          transition: all 0.15s;
        }

        .ide-explorer-item-active {
          color: var(--primary);
          background: rgba(0, 255, 136, 0.05);
          border-left: 2px solid var(--primary);
        }

        .ide-editor {
          flex: 1;
          padding: 16px 20px;
          font-family: var(--font-display);
          font-size: 12.5px;
          line-height: 1.9;
          overflow: hidden;
        }

        .ide-preview {
          width: 260px;
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }

        .ide-preview-header {
          padding: 8px 14px;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-display);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ide-preview-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(5, 5, 16, 0.6);
        }

        .ide-terminal {
          border-top: 1px solid var(--border);
          padding: 10px 18px;
          font-family: var(--font-display);
          font-size: 12px;
          color: var(--text-muted);
          background: rgba(5, 5, 16, 0.6);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .terminal-cursor {
          display: inline-block;
          width: 8px;
          height: 16px;
          background: var(--primary);
          animation: blink 1s step-end infinite;
        }

        /* Features */
        .features-section {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 24px 120px;
          position: relative;
          z-index: 1;
        }

        .section-label {
          font-family: var(--font-display);
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 800;
          margin: 0;
          letter-spacing: -1px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .feature-card {
          background: rgba(10, 15, 30, 0.6);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 28px 24px;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .feature-card:hover::before { opacity: 1; }

        .feature-card:hover {
          border-color: rgba(91, 108, 249, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(91, 108, 249, 0.08);
        }

        .feature-icon {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(91, 108, 249, 0.08);
          border: 1px solid rgba(91, 108, 249, 0.12);
        }

        .feature-title {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .feature-desc {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* How it works */
        .steps-section {
          max-width: 740px;
          margin: 0 auto;
          padding: 0 24px 120px;
          position: relative;
          z-index: 1;
        }

        .step-card {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          background: rgba(10, 15, 30, 0.6);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px 28px;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
        }

        .step-card:hover {
          border-color: rgba(0, 255, 136, 0.2);
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.05);
        }

        .step-number {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(180deg, var(--primary), rgba(0, 255, 136, 0.1));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          flex-shrink: 0;
        }

        .step-title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .step-desc {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* Pricing */
        .pricing-section {
          max-width: 480px;
          margin: 0 auto;
          padding: 0 24px 120px;
          position: relative;
          z-index: 1;
        }

        .pricing-card {
          background: rgba(10, 15, 30, 0.8);
          border: 1px solid rgba(0, 255, 136, 0.15);
          border-radius: 16px;
          padding: 40px 36px;
          text-align: center;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 60px rgba(0, 255, 136, 0.05);
        }

        .pricing-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent);
        }

        .pricing-label {
          font-family: var(--font-display);
          font-size: 11px;
          color: var(--primary);
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .pricing-value {
          font-family: var(--font-display);
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .pricing-period {
          font-size: 16px;
          color: var(--text-muted);
          font-weight: 400;
        }

        .pricing-desc {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--text-muted);
          margin: 10px 0 28px;
          line-height: 1.6;
        }

        .pricing-features {
          text-align: left;
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pricing-feature {
          font-family: var(--font-body);
          font-size: 13px;
          color: #9ba3c7;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .pricing-check {
          color: var(--primary);
          font-size: 14px;
          text-shadow: 0 0 8px var(--glow-primary);
        }

        .btn-pricing {
          width: 100%;
          background: linear-gradient(135deg, var(--primary), #3EEDB0);
          color: #000;
          border: none;
          border-radius: 10px;
          padding: 16px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font-display);
          letter-spacing: 0.5px;
          transition: all 0.3s;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
        }

        .btn-pricing:hover {
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.3);
          transform: translateY(-1px);
        }

        .pricing-note {
          font-family: var(--font-body);
          font-size: 11px;
          color: #3a3f5c;
          margin-top: 16px;
        }

        /* Footer */
        .footer {
          border-top: 1px solid var(--border);
          padding: 28px clamp(16px, 4vw, 40px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          font-family: var(--font-display);
          font-size: 11px;
          color: #3a3f5c;
          letter-spacing: 1px;
          position: relative;
          z-index: 1;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .ide-explorer, .ide-preview { display: none !important; }
          .nav-links-desktop { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Background effects */}
      <div className="grid-bg" />
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />

      {/* Nav */}
      <nav className="nav-glass">
        <div className="nav-logo">
          <span className="nav-logo-symbol">∞</span>
          Infinit Code
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link nav-links-desktop">Features</a>
          <a href="#pricing" className="nav-link nav-links-desktop">Preços</a>
          {session ? (
            <button onClick={() => router.push('/dashboard')} className="btn-primary">
              Dashboard
            </button>
          ) : (
            <button onClick={() => router.push('/auth/login')} className="btn-primary">
              Entrar
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          O primeiro IDE feito para IA
        </div>
        <h1 className="hero-title">
          Do prompt ao deploy.<br />
          <span className="hero-title-gradient">Sem paradas.</span>
        </h1>
        <p className="hero-sub">
          Abra o browser e tenha um ambiente completo de desenvolvimento com Claude Code
          já integrado. Seu próximo projeto está a um prompt de existir.
        </p>
        <div className="hero-actions">
          <button onClick={handleCTA} className="btn-hero">
            Começar a criar →
          </button>
          <a href="#como" className="btn-outline">
            Como funciona
          </a>
        </div>
      </section>

      {/* IDE Preview */}
      <section className="ide-section">
        <div className="ide-mockup">
          <div className="ide-titlebar">
            <div className="ide-dot" style={{ background: '#ff5f57' }} />
            <div className="ide-dot" style={{ background: '#febc2e' }} />
            <div className="ide-dot" style={{ background: '#28c840' }} />
            <span className="ide-titlebar-text">∞ INFINIT CODE IDE</span>
          </div>
          <div className="ide-body">
            {/* Explorer */}
            <div className="ide-explorer" style={{ display: undefined }}>
              {[
                { name: '▸ src', active: false },
                { name: '  App.tsx', active: true },
                { name: '  index.css', active: false },
                { name: '▸ components', active: false },
                { name: '  Hero.tsx', active: false },
                { name: 'package.json', active: false },
              ].map((f, i) => (
                <div key={i} className={`ide-explorer-item ${f.active ? 'ide-explorer-item-active' : ''}`}>
                  {f.name}
                </div>
              ))}
            </div>
            {/* Editor */}
            <div className="ide-editor">
              <div><span style={{ color: '#5B6CF9' }}>import</span> <span style={{ color: '#e8e8e8' }}>{'{ useState }'}</span> <span style={{ color: '#5B6CF9' }}>from</span> <span style={{ color: '#3EEDB0' }}>{`'react'`}</span></div>
              <div><span style={{ color: '#5B6CF9' }}>import</span> <span style={{ color: '#e8e8e8' }}>{'{ Hero }'}</span> <span style={{ color: '#5B6CF9' }}>from</span> <span style={{ color: '#3EEDB0' }}>{`'./Hero'`}</span></div>
              <div style={{ color: '#1a1f38' }}>&nbsp;</div>
              <div><span style={{ color: '#5B6CF9' }}>export default function</span> <span style={{ color: '#febc2e' }}>App</span><span style={{ color: '#e8e8e8' }}>() {'{'}</span></div>
              <div><span style={{ color: '#e8e8e8' }}>&nbsp; </span><span style={{ color: '#5B6CF9' }}>const</span> <span style={{ color: '#e8e8e8' }}>[count, setCount] =</span> <span style={{ color: '#febc2e' }}>useState</span><span style={{ color: '#e8e8e8' }}>(0)</span></div>
              <div><span style={{ color: '#e8e8e8' }}>&nbsp; </span><span style={{ color: '#5B6CF9' }}>return</span> <span style={{ color: '#e8e8e8' }}>{'<Hero count={count} />'}</span></div>
              <div><span style={{ color: '#e8e8e8' }}>{'}'}</span></div>
            </div>
            {/* Preview */}
            <div className="ide-preview">
              <div className="ide-preview-header">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3EEDB0', display: 'inline-block', boxShadow: '0 0 6px rgba(62, 237, 176, 0.6)' }} />
                PREVIEW
              </div>
              <div className="ide-preview-body">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>0</div>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--primary), #3EEDB0)',
                    color: '#000',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: 1,
                  }}>Incrementar</div>
                </div>
              </div>
            </div>
          </div>
          {/* Terminal */}
          <div className="ide-terminal">
            <span style={{ color: '#3EEDB0' }}>❯</span>
            <span>claude</span>
            <span className="terminal-cursor" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-label">Por que Infinit</div>
          <h2 className="section-title">
            Seu loop infinito <span style={{ color: 'var(--text-muted)' }}>de criação.</span>
          </h2>
        </div>

        <div className="features-grid">
          {[
            {
              icon: '{ }',
              title: 'Editor pro-grade',
              desc: 'Monaco — o coração do VS Code. Autocomplete, multi-cursor, atalhos que você já conhece.',
              color: '#5B6CF9',
            },
            {
              icon: '>_',
              title: 'Seu Linux na nuvem',
              desc: 'Container isolado com Node.js 22. Rode qualquer coisa sem poluir sua máquina.',
              color: '#3EEDB0',
            },
            {
              icon: '∞',
              title: 'IA nativa, não colada',
              desc: 'Claude Code vem pré-instalado com 4 skills exclusivas. Não é um chatbot — é um par que lê seu projeto inteiro.',
              color: 'var(--primary)',
            },
            {
              icon: '⟳',
              title: 'Veja enquanto cria',
              desc: 'Live preview instantâneo. HTML, React, TSX — cada tecla atualiza o resultado.',
              color: '#febc2e',
            },
            {
              icon: '⑂',
              title: 'Git sem sair do flow',
              desc: 'Clone, commit e push pro GitHub direto do IDE. Sem trocar de aba.',
              color: '#e8e8e8',
            },
            {
              icon: '◇',
              title: 'Comece mais rápido',
              desc: 'Snippets prontos para React, HTML, CSS, hooks. Um clique e o código está no editor.',
              color: '#c084fc',
            },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ color: f.color, borderColor: `${f.color}22`, background: `${f.color}0a` }}>
                {f.icon}
              </div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="como" className="steps-section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-label">Como funciona</div>
          <h2 className="section-title">
            Abra o browser. <span style={{ color: 'var(--text-muted)' }}>Comece a criar.</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { step: '01', title: 'Entre com Google', desc: 'Um clique. Sem formulário, sem confirmar email, sem esperar.' },
            { step: '02', title: 'Seu IDE carrega', desc: 'Editor, terminal e preview prontos em segundos. Container Linux exclusivo pra você.' },
            { step: '03', title: 'Chame o Claude', desc: 'Digite claude no terminal. Ele já conhece seus arquivos, já tem as skills. Só pedir.' },
          ].map((s) => (
            <div key={s.step} className="step-card">
              <span className="step-number">{s.step}</span>
              <div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Para quem */}
      <section className="steps-section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-label">Pra quem é</div>
          <h2 className="section-title">
            Se você se reconhece, <span style={{ color: 'var(--text-muted)' }}>é pra você.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            {
              emoji: '❯',
              title: 'Dev que usa Claude Code',
              desc: 'Quer um ambiente cloud com o Claude já pronto, sem instalar nada local.',
            },
            {
              emoji: '△',
              title: 'Indie maker',
              desc: 'Valida ideias rápido. Precisa ir do zero ao deploy no mesmo dia.',
            },
            {
              emoji: '⊞',
              title: 'Dev em qualquer máquina',
              desc: 'Chromebook, tablet, PC do trabalho — seu IDE está no browser.',
            },
            {
              emoji: '⟡',
              title: 'Quem está aprendendo',
              desc: 'Ambiente profissional sem a dor de configurar ambiente. Foco no código.',
            },
          ].map((p) => (
            <div key={p.title} className="step-card" style={{ flexDirection: 'column', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--primary)', textShadow: '0 0 12px var(--glow-primary)' }}>{p.emoji}</span>
              <div>
                <div className="step-title">{p.title}</div>
                <div className="step-desc">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing-section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-label">Preço</div>
          <h2 className="section-title">
            Um plano. <span style={{ color: 'var(--text-muted)' }}>Sem surpresas.</span>
          </h2>
        </div>

        <div className="pricing-card">
          <div className="pricing-label">Pro</div>
          <div className="pricing-value">
            R$67<span className="pricing-period">/mês</span>
          </div>
          <p className="pricing-desc">
            Menos que um almoço por semana. IDE completo + IA nativa + infra na nuvem.
          </p>
          <div className="pricing-features">
            {[
              'Editor Monaco completo (VS Code engine)',
              'Terminal Linux com Node.js 22',
              'Claude Code pré-instalado + 4 skills',
              'Clone e push pro GitHub integrado',
              'Live preview (HTML, React, TSX)',
              'Container isolado por usuário',
              'Servidores em São Paulo (latência mínima)',
              'Custo de IA = zero (usa sua conta Claude)',
            ].map((item) => (
              <div key={item} className="pricing-feature">
                <span className="pricing-check">✓</span>
                {item}
              </div>
            ))}
          </div>
          <button onClick={handleCTA} className="btn-pricing">
            Começar agora →
          </button>
          <p className="pricing-note">
            Você usa sua própria conta claude.ai. Infinit Code cobra só pela infra — a IA é por sua conta, literalmente.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '0 24px 100px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Seu próximo projeto<br />
          <span className="hero-title-gradient">começa aqui.</span>
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: 32,
        }}>
          Sem instalar. Sem configurar. Sem esperar.<br />
          Abre o browser e o futuro do desenvolvimento já está rodando.
        </p>
        <button onClick={handleCTA} className="btn-hero">
          Criar meu primeiro projeto →
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span>∞ Infinit Code — {new Date().getFullYear()}</span>
        <span style={{ color: '#2a2f48' }}>Feito com Claude Code</span>
      </footer>
    </div>
  );
}
