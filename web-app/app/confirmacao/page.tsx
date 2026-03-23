'use client';
import { useState } from 'react';

const DEMO_KEY = 'INFT-A7X2-K9M4-P3N8';
const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E")`;

export default function ConfirmacaoPage() {
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    await navigator.clipboard.writeText(DEMO_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#e8e9ec;--white:rgba(255,255,255,0.55);--white-hi:rgba(255,255,255,0.72);
          --rim:rgba(255,255,255,0.85);--rim2:rgba(255,255,255,0.5);
          --shadow:rgba(0,0,0,0.08);--shadow2:rgba(0,0,0,0.14);
          --green:#3CB043;--green-lt:rgba(60,176,67,0.12);
          --ink:#1a1c20;--ink2:#4a4d55;--ink3:#8a8d96;--ink4:#b0b3bc;
          --mono:'JetBrains Mono',monospace;--serif:'DM Serif Display',serif;--sans:'DM Sans',sans-serif;
        }
        html,body{height:100%}
        body{background:var(--bg);background-image:${NOISE};font-family:var(--sans);color:var(--ink);min-height:100vh;display:flex;flex-direction:column}
        .glass{background:var(--white);backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);border-radius:20px;position:relative;overflow:hidden;box-shadow:0 1px 0 var(--rim) inset,1px 0 0 var(--rim2) inset,-1px 0 0 rgba(255,255,255,0.3) inset,0 -1px 0 rgba(0,0,0,0.04) inset,0 8px 32px var(--shadow),0 2px 8px var(--shadow)}
        .glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(135deg,rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.2) 40%,transparent 70%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:10}
        .glass::after{content:'';position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%);border-radius:20px 20px 0 0;pointer-events:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes checkIn{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', background: 'rgba(232,233,236,0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: 'var(--white-hi)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 0 var(--rim) inset, 0 4px 12px var(--shadow2)' }}>
            <svg width="18" height="11" viewBox="0 0 24 15" fill="none"><path d="M8.5 7.5C8.5 7.5 6 2 3 2C1.2 2 .5 3.8 .5 7.5C.5 11.2 1.2 13 3 13C6 13 8.5 7.5 8.5 7.5Z" stroke="#3CB043" strokeWidth="1.5" fill="none"/><path d="M15.5 7.5C15.5 7.5 18 2 21 2C22.8 2 23.5 3.8 23.5 7.5C23.5 11.2 22.8 13 21 13C18 13 15.5 7.5 15.5 7.5Z" stroke="#3CB043" strokeWidth="1.5" fill="none"/><path d="M8.5 7.5H15.5" stroke="#3CB043" strokeWidth="1.5"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--ink2)' }}>Infinit <b style={{ fontWeight: 500, color: 'var(--green)' }}>Code</b></span>
        </a>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp .5s ease both' }}>

          {/* Success banner */}
          <div style={{ background: 'var(--green)', borderRadius: 20, padding: '32px 36px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 8px 32px rgba(60,176,67,0.2), 0 2px 8px rgba(60,176,67,0.1)' }}>
            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 0 rgba(255,255,255,0.3) inset', animation: 'checkIn .6s .1s cubic-bezier(.34,1.56,.64,1) both' }}>
              <svg width="28" height="22" viewBox="0 0 40 32" fill="none"><path d="M3 16L14 27L37 5" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: 'white', letterSpacing: '-.01em', marginBottom: 6 }}>Bem-vindo ao Pro! 🎉</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 300, lineHeight: 1.5 }}>Sua assinatura foi confirmada. Sua chave de licença está abaixo.</p>
            </div>
          </div>

          {/* License key */}
          <div className="glass" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink4)', fontFamily: 'monospace', marginBottom: 20 }}>Sua chave de licença</div>
            <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 400, color: 'var(--ink)', letterSpacing: '.1em', marginBottom: 8, position: 'relative', zIndex: 1 }}>
              {DEMO_KEY.split('-').map((seg, i) => (
                <span key={i}>{i > 0 && <span style={{ color: 'var(--ink4)', margin: '0 2px' }}>-</span>}{seg}</span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink4)', fontFamily: 'monospace', marginBottom: 16, position: 'relative', zIndex: 1 }}>Esta chave também foi enviada para seu email.</p>
            <button
              onClick={copyKey}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 12, color: copied ? 'var(--green)' : 'var(--ink3)', fontFamily: 'monospace', cursor: 'pointer', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 8px var(--shadow)', transition: 'all .2s', position: 'relative', zIndex: 1 }}
            >
              {copied ? '✓ Copiado!' : '📋 Copiar chave'}
            </button>
          </div>

          {/* Next steps */}
          <div className="glass" style={{ padding: '28px 36px' }}>
            <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink4)', fontFamily: 'monospace', marginBottom: 20, position: 'relative', zIndex: 1 }}>Próximos passos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
              {[
                { n: '1', title: 'Baixe o Infinit Code', desc: 'Disponível para Mac, Windows e Linux', action: 'Ir para download →', href: '/download' },
                { n: '2', title: 'Instale e abra o app', desc: 'Siga o guia de instalação na página de download' },
                { n: '3', title: 'Cole sua chave de licença', desc: `Use a chave ${DEMO_KEY} na tela de ativação` },
              ].map((step) => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 600, color: 'var(--green)', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 8px var(--shadow)' }}>{step.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{step.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink3)', fontWeight: 300 }}>{step.desc}</div>
                    {step.action && step.href && (
                      <a href={step.href} style={{ fontSize: 13, color: 'var(--green)', textDecoration: 'none', fontWeight: 500, display: 'inline-block', marginTop: 6 }}>{step.action}</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support */}
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink4)', position: 'relative', zIndex: 1 }}>
            Dúvidas? Entre em contato: <a href="mailto:suporte@infinitcode.app" style={{ color: 'var(--green)', textDecoration: 'none' }}>suporte@infinitcode.app</a>
          </div>
        </div>
      </div>
    </>
  );
}
