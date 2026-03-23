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
    <div style={{ minHeight: '100vh', background: '#06060f', color: '#e2e4f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root {
          --primary: #7c5cfc;
          --primary-light: #a78bfa;
          --accent: #3EEDB0;
          --bg: #06060f;
          --surface: #0c0c1d;
          --surface-2: #111128;
          --border: rgba(124, 92, 252, 0.12);
          --border-hover: rgba(124, 92, 252, 0.3);
          --glow: rgba(124, 92, 252, 0.4);
          --glow-accent: rgba(62, 237, 176, 0.4);
          --text: #e2e4f0;
          --text-muted: #6e7191;
          --font-display: 'Syne', sans-serif;
          --font-body: 'Space Grotesk', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ===== INFINITY SYMBOL ANIMATION ===== */
        .infinity-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 80px;
          font-family: var(--font-display);
          font-weight: 800;
          color: rgba(124, 92, 252, 0.06);
          pointer-events: none;
          z-index: 0;
          animation: infinityPulse 8s ease-in-out infinite;
        }

        @keyframes infinityPulse {
          0% {
            font-size: 80px;
            opacity: 0;
            color: rgba(124, 92, 252, 0.03);
            letter-spacing: 0px;
          }
          20% {
            opacity: 1;
            color: rgba(124, 92, 252, 0.08);
          }
          50% {
            font-size: 420px;
            opacity: 0.15;
            color: rgba(124, 92, 252, 0.12);
            letter-spacing: 20px;
          }
          80% {
            font-size: 700px;
            opacity: 0.04;
            color: rgba(124, 92, 252, 0.04);
            letter-spacing: 40px;
          }
          100% {
            font-size: 900px;
            opacity: 0;
            color: rgba(124, 92, 252, 0);
            letter-spacing: 60px;
          }
        }

        /* ===== GRID BG ===== */
        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(124, 92, 252, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 92, 252, 0.025) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(80px);
        }

        .glow-orb-1 {
          width: 500px; height: 500px;
          top: -150px; right: -100px;
          background: rgba(124, 92, 252, 0.12);
          animation: orbDrift 12s ease-in-out infinite;
        }

        .glow-orb-2 {
          width: 400px; height: 400px;
          bottom: 20%; left: -80px;
          background: rgba(62, 237, 176, 0.08);
          animation: orbDrift 15s ease-in-out infinite reverse;
        }

        @keyframes orbDrift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, 30px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* ===== NAV ===== */
        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px clamp(20px, 5vw, 48px);
          background: rgba(6, 6, 15, 0.85);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 16px;
          color: var(--text);
          letter-spacing: 0.5px;
        }

        .nav-brand-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--primary);
          border-radius: 6px;
          font-size: 16px;
          color: #fff;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-link:hover { color: var(--text); }

        .btn-nav {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          background: var(--primary);
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 0 20px rgba(124, 92, 252, 0.25);
        }

        .btn-nav:hover {
          box-shadow: 0 0 30px rgba(124, 92, 252, 0.4);
          transform: translateY(-1px);
        }

        /* ===== HERO ===== */
        .hero {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: clamp(80px, 14vw, 140px) 24px clamp(60px, 10vw, 100px);
          max-width: 900px;
          margin: 0 auto;
          z-index: 1;
          overflow: hidden;
        }

        .hero-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 32px;
          background: rgba(62, 237, 176, 0.06);
          border: 1px solid rgba(62, 237, 176, 0.15);
          border-radius: 30px;
          padding: 8px 20px;
          animation: fadeUp 0.5s ease-out;
        }

        .hero-badge-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          margin-right: 10px;
          box-shadow: 0 0 8px var(--glow-accent);
        }

        .hero-h1 {
          font-family: var(--font-display);
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -2px;
          margin-bottom: 28px;
          position: relative;
          z-index: 2;
          animation: fadeUp 0.5s ease-out 0.1s both;
        }

        .hero-h1-gradient {
          background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 40%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-family: var(--font-body);
          font-size: clamp(15px, 2.5vw, 18px);
          font-weight: 400;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 500px;
          margin-bottom: 44px;
          animation: fadeUp 0.5s ease-out 0.2s both;
        }

        .hero-sub strong {
          color: var(--text);
          font-weight: 600;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.5s ease-out 0.3s both;
        }

        .btn-hero {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          background: var(--primary);
          border: none;
          border-radius: 10px;
          padding: 16px 36px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 24px rgba(124, 92, 252, 0.3);
        }

        .btn-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(124, 92, 252, 0.45);
        }

        .btn-ghost {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 500;
          color: var(--text-muted);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 32px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
        }

        .btn-ghost:hover {
          border-color: var(--border-hover);
          color: var(--text);
        }

        .hero-note {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 20px;
          opacity: 0.6;
          animation: fadeUp 0.5s ease-out 0.4s both;
        }

        /* ===== IDE MOCKUP ===== */
        .ide-wrap {
          max-width: 920px;
          margin: 0 auto 140px;
          padding: 0 24px;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.7s ease-out 0.5s both;
        }

        .ide-frame {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(124, 92, 252, 0.05),
            0 24px 64px rgba(0, 0, 0, 0.5),
            0 0 60px rgba(124, 92, 252, 0.06);
        }

        .ide-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 12px 16px;
          background: var(--surface-2);
          border-bottom: 1px solid var(--border);
        }

        .ide-bar-dot { width: 10px; height: 10px; border-radius: 50%; }

        .ide-bar-title {
          flex: 1;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 1px;
        }

        .ide-content { display: flex; height: clamp(200px, 38vw, 320px); }

        .ide-sidebar {
          width: 180px;
          border-right: 1px solid var(--border);
          padding: 12px 0;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }

        .ide-file { padding: 4px 16px; transition: all 0.15s; }
        .ide-file-active {
          color: var(--primary-light);
          background: rgba(124, 92, 252, 0.06);
          border-left: 2px solid var(--primary);
        }

        .ide-editor {
          flex: 1;
          padding: 16px 20px;
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 2;
          overflow: hidden;
        }

        .ide-preview-pane {
          width: 240px;
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }

        .ide-preview-bar {
          padding: 8px 14px;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ide-preview-live {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 6px var(--glow-accent);
        }

        .ide-preview-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 6, 15, 0.5);
        }

        .ide-terminal-bar {
          border-top: 1px solid var(--border);
          padding: 10px 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
          background: rgba(6, 6, 15, 0.5);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cursor-blink {
          display: inline-block;
          width: 8px; height: 15px;
          background: var(--primary);
          animation: blink 1s step-end infinite;
        }

        /* ===== SECTIONS ===== */
        .section-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .section-label span { color: var(--primary-light); }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(28px, 6vw, 48px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        /* ===== FEATURES ===== */
        .features-wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 24px 140px;
          position: relative;
          z-index: 1;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .feat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 28px 24px;
          transition: all 0.3s;
          position: relative;
        }

        .feat-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(124, 92, 252, 0.08);
        }

        .feat-emoji {
          font-size: 24px;
          margin-bottom: 18px;
          display: block;
        }

        .feat-name {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }

        .feat-desc {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .feat-tag {
          display: inline-block;
          margin-top: 14px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          color: var(--primary-light);
          background: rgba(124, 92, 252, 0.1);
          border: 1px solid rgba(124, 92, 252, 0.15);
          border-radius: 4px;
          padding: 3px 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* ===== STEPS ===== */
        .steps-wrap {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 24px 140px;
          position: relative;
          z-index: 1;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .step-item {
          text-align: center;
        }

        .step-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px; height: 48px;
          border-radius: 12px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 800;
          color: var(--primary-light);
          margin-bottom: 16px;
        }

        .step-name {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }

        .step-text {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* ===== AUDIENCE ===== */
        .audience-wrap {
          max-width: 740px;
          margin: 0 auto;
          padding: 0 24px 140px;
          position: relative;
          z-index: 1;
        }

        .audience-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .audience-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          transition: all 0.3s;
        }

        .audience-card:hover {
          border-color: var(--border-hover);
        }

        .audience-icon {
          font-family: var(--font-mono);
          font-size: 18px;
          color: var(--primary-light);
          margin-bottom: 12px;
          text-shadow: 0 0 12px var(--glow);
        }

        .audience-title {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }

        .audience-desc {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* ===== PRICING ===== */
        .pricing-wrap {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px 140px;
          position: relative;
          z-index: 1;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .price-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px 28px;
          position: relative;
        }

        .price-card-pro {
          border-color: rgba(124, 92, 252, 0.3);
          box-shadow: 0 0 40px rgba(124, 92, 252, 0.06);
        }

        .price-card-pro::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          border-radius: 16px 16px 0 0;
        }

        .price-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          color: #fff;
          background: var(--primary);
          border-radius: 4px;
          padding: 3px 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .price-tier {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .price-value {
          font-family: var(--font-display);
          font-size: 44px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 4px;
        }

        .price-value-zero { color: var(--text-muted); }

        .price-period {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .price-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
        }

        .price-list li {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-list li::before {
          content: '✓';
          color: var(--accent);
          font-size: 12px;
          flex-shrink: 0;
        }

        .price-list-muted li::before {
          color: var(--text-muted);
          opacity: 0.4;
        }

        .btn-price {
          width: 100%;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-price-free {
          color: var(--text-muted);
          background: var(--surface-2);
          border: 1px solid var(--border);
        }

        .btn-price-free:hover { border-color: var(--border-hover); color: var(--text); }

        .btn-price-pro {
          color: #fff;
          background: var(--primary);
          box-shadow: 0 4px 20px rgba(124, 92, 252, 0.3);
        }

        .btn-price-pro:hover {
          box-shadow: 0 8px 30px rgba(124, 92, 252, 0.45);
          transform: translateY(-1px);
        }

        /* ===== FINAL CTA ===== */
        .cta-final {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 24px 120px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        /* ===== FOOTER ===== */
        .footer {
          border-top: 1px solid var(--border);
          padding: 24px clamp(20px, 5vw, 48px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 11px;
          color: #2e3050;
          letter-spacing: 0.5px;
          position: relative;
          z-index: 1;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .ide-sidebar, .ide-preview-pane { display: none !important; }
          .nav-desktop { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .audience-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* BG layers */}
      <div className="grid-bg" />
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      {/* Nav */}
      <nav className="nav">
        <div className="nav-brand">
          <span className="nav-brand-icon">∞</span>
          Infinit Code
        </div>
        <div className="nav-menu">
          <a href="#recursos" className="nav-link nav-desktop">Recursos</a>
          <a href="#precos" className="nav-link nav-desktop">Preços</a>
          <a href="#como" className="nav-link nav-desktop">Como Funciona</a>
          {session ? (
            <button onClick={() => router.push('/dashboard')} className="btn-nav">Dashboard</button>
          ) : (
            <button onClick={() => router.push('/auth/login')} className="btn-nav">Começar grátis →</button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="infinity-bg">∞</div>

        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Cloud IDE · Disponível agora
        </div>

        <h1 className="hero-h1">
          Seu ambiente.<br />
          <span className="hero-h1-gradient">Sua IA. Seu ritmo.</span>
        </h1>

        <p className="hero-sub">
          IDE completo no browser com <strong>Claude Code nativo</strong>.
          Do prompt ao deploy — sem instalar, sem configurar, sem esperar.
        </p>

        <div className="hero-actions">
          <button onClick={handleCTA} className="btn-hero">
            Começar a criar →
          </button>
          <a href="#recursos" className="btn-ghost">
            Ver recursos Pro
          </a>
        </div>

        <p className="hero-note">Sem configuração. Pronto em 30 segundos.</p>
      </section>

      {/* IDE Mockup */}
      <section className="ide-wrap">
        <div className="ide-frame">
          <div className="ide-bar">
            <div className="ide-bar-dot" style={{ background: '#ff5f57' }} />
            <div className="ide-bar-dot" style={{ background: '#febc2e' }} />
            <div className="ide-bar-dot" style={{ background: '#28c840' }} />
            <span className="ide-bar-title">App.tsx — Infinit Code · IDE</span>
          </div>
          <div className="ide-content">
            <div className="ide-sidebar">
              {[
                { name: '▸ src', active: false },
                { name: '  App.tsx', active: true },
                { name: '  index.css', active: false },
                { name: '▸ components', active: false },
                { name: '  Hero.tsx', active: false },
                { name: 'package.json', active: false },
              ].map((f, i) => (
                <div key={i} className={`ide-file ${f.active ? 'ide-file-active' : ''}`}>{f.name}</div>
              ))}
            </div>
            <div className="ide-editor">
              <div><span style={{ color: '#7c5cfc' }}>import</span> {'{ useState }'} <span style={{ color: '#7c5cfc' }}>from</span> <span style={{ color: '#3EEDB0' }}>{`'react'`}</span></div>
              <div><span style={{ color: '#7c5cfc' }}>import</span> {'{ Hero }'} <span style={{ color: '#7c5cfc' }}>from</span> <span style={{ color: '#3EEDB0' }}>{`'./Hero'`}</span></div>
              <div style={{ opacity: 0.1 }}>&nbsp;</div>
              <div><span style={{ color: '#7c5cfc' }}>export default function</span> <span style={{ color: '#febc2e' }}>App</span>() {'{'}</div>
              <div>&nbsp; <span style={{ color: '#7c5cfc' }}>const</span> [count, setCount] = <span style={{ color: '#febc2e' }}>useState</span>(0)</div>
              <div>&nbsp; <span style={{ color: '#7c5cfc' }}>return</span> {'<Hero count={count} />'}</div>
              <div>{'}'}</div>
            </div>
            <div className="ide-preview-pane">
              <div className="ide-preview-bar">
                <span className="ide-preview-live" />
                PREVIEW
              </div>
              <div className="ide-preview-body">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 10 }}>Hello, Infinit Code</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 160, margin: '0 auto 12px' }}>
                    Live Preview sem configuração. Escreva e veja o resultado.
                  </div>
                  <div style={{
                    display: 'inline-block',
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                  }}>PRO</div>
                </div>
              </div>
            </div>
          </div>
          <div className="ide-terminal-bar">
            <span style={{ color: 'var(--accent)' }}>$</span>
            <span>claude</span>
            <span className="cursor-blink" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="features-wrap">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label"><span>//</span> RECURSOS</div>
          <h2 className="section-title">
            Tudo que você precisa<br />para entregar mais rápido.
          </h2>
        </div>

        <div className="features-grid">
          {[
            {
              emoji: '⚡',
              name: 'Live Preview',
              desc: 'Preview lado a lado para HTML e React. Atualiza em tempo real via WebSocket.',
              tag: null,
            },
            {
              emoji: '🤖',
              name: 'Claude Code nativo',
              desc: 'Pré-instalado com 4 skills exclusivas. Não é um chatbot — lê seu projeto inteiro e executa.',
              tag: 'PRO',
            },
            {
              emoji: '📦',
              name: 'Snippets Library',
              desc: 'Templates prontos para React, Tailwind, CSS, hooks. Um clique e o código está no editor.',
              tag: 'PRO',
            },
            {
              emoji: '☁️',
              name: 'Terminal Linux',
              desc: 'Container isolado com Node.js 22. Rode qualquer coisa sem poluir sua máquina.',
              tag: null,
            },
            {
              emoji: '🎨',
              name: 'Editor Monaco',
              desc: 'O motor do VS Code. Autocomplete, multi-cursor, syntax highlighting, atalhos familiares.',
              tag: null,
            },
            {
              emoji: '🔗',
              name: 'GitHub integrado',
              desc: 'Clone, commit e push direto do IDE. OAuth nativo, sem sair do flow.',
              tag: 'PRO',
            },
          ].map((f) => (
            <div key={f.name} className="feat-card">
              <span className="feat-emoji">{f.emoji}</span>
              <div className="feat-name">{f.name}</div>
              <div className="feat-desc">{f.desc}</div>
              {f.tag && <span className="feat-tag">{f.tag}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="como" className="steps-wrap">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label"><span>//</span> COMO FUNCIONA</div>
          <h2 className="section-title">
            No ar em<br />minutos.
          </h2>
        </div>

        <div className="steps-grid">
          {[
            { num: '1', name: 'Entre', desc: 'Login com Google. Um clique, sem formulário.' },
            { num: '2', name: 'Abra o IDE', desc: 'Editor, terminal e preview carregam em segundos.' },
            { num: '3', name: 'Chame o Claude', desc: 'Digite claude no terminal. As skills já estão prontas.' },
          ].map((s) => (
            <div key={s.num} className="step-item">
              <div className="step-num">{s.num}</div>
              <div className="step-name">{s.name}</div>
              <div className="step-text">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section className="audience-wrap">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label"><span>//</span> PRA QUEM</div>
          <h2 className="section-title">
            Se você se reconhece,<br />é pra você.
          </h2>
        </div>

        <div className="audience-grid">
          {[
            { icon: '❯_', title: 'Dev que usa Claude Code', desc: 'Ambiente cloud com Claude pré-instalado. Sem configurar nada local.' },
            { icon: '△', title: 'Indie maker', desc: 'Do zero ao deploy no mesmo dia. Valide rápido, itere mais rápido.' },
            { icon: '⊞', title: 'Qualquer máquina', desc: 'Chromebook, tablet, PC do trabalho. Seu IDE está no browser.' },
            { icon: '⟡', title: 'Quem está aprendendo', desc: 'Ambiente profissional sem a dor de configurar. Foco no código.' },
          ].map((a) => (
            <div key={a.title} className="audience-card">
              <div className="audience-icon">{a.icon}</div>
              <div className="audience-title">{a.title}</div>
              <div className="audience-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="pricing-wrap">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label"><span>//</span> PREÇOS</div>
          <h2 className="section-title">
            Preço simples.
          </h2>
        </div>

        <div className="pricing-grid">
          {/* Free */}
          <div className="price-card">
            <div className="price-tier">Free</div>
            <div className="price-value price-value-zero">
              R$<span style={{ fontSize: 44 }}>0</span>
            </div>
            <div className="price-period">para sempre</div>
            <ul className="price-list price-list-muted">
              <li>Live Preview (HTML + React)</li>
              <li>Overlay básico de erros</li>
              <li>AI Chat</li>
              <li>Snippets limitados</li>
            </ul>
            <button onClick={handleCTA} className="btn-price btn-price-free">
              Começar grátis →
            </button>
          </div>

          {/* Pro */}
          <div className="price-card price-card-pro">
            <span className="price-badge">Popular</span>
            <div className="price-tier">Pro</div>
            <div className="price-value">
              R$<span style={{ fontSize: 44 }}>67</span>
            </div>
            <div className="price-period">/ mês · cancele quando quiser</div>
            <ul className="price-list">
              <li>Tudo do Free</li>
              <li>Claude Code nativo + 4 skills</li>
              <li>Smart Snippets Library</li>
              <li>GitHub clone/push integrado</li>
              <li>Container Linux isolado</li>
              <li>Servidores São Paulo</li>
              <li>Suporte prioritário</li>
            </ul>
            <button onClick={handleCTA} className="btn-price btn-price-pro">
              Assinar Pro → R$67/mês →
            </button>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#2e3050',
          marginTop: 20,
        }}>
          * A IA usa sua conta claude.ai. Custo de IA = zero pro Infinit Code.
        </p>
      </section>

      {/* Final CTA */}
      <section className="cta-final">
        <h2 className="section-title" style={{ marginBottom: 20 }}>
          Seu próximo projeto<br />
          <span className="hero-h1-gradient">começa aqui.</span>
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: 36,
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
        <span>Feito com ∞ por Infinit Code</span>
        <span>support@infinitcode.netlify.app</span>
      </footer>
    </div>
  );
}
