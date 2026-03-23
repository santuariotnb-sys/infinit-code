'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E")`;

const CHECK_SVG = <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#3CB043" strokeWidth="1.4" strokeLinecap="round"/></svg>;

const INCLUDES = [
  'Claude Code integrado com terminal nativo',
  'Preview ao vivo em tempo real',
  'Voz PT-BR (/voice nativo)',
  '6 Skills Infinit pré-instaladas',
  'GitHub OAuth local + sync',
  'Mac · Windows · Linux',
  'Suporte prioritário em português',
];

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push('/confirmacao'), 1500);
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
          --green:#3CB043;--green-lt:rgba(60,176,67,0.12);--green-b:rgba(60,176,67,0.3);
          --ink:#1a1c20;--ink2:#4a4d55;--ink3:#8a8d96;--ink4:#b0b3bc;
          --mono:'JetBrains Mono',monospace;--serif:'DM Serif Display',serif;--sans:'DM Sans',sans-serif;
        }
        html,body{height:100%}
        body{background:var(--bg);background-image:${NOISE};font-family:var(--sans);color:var(--ink);min-height:100vh;display:flex;flex-direction:column}
        .glass{background:var(--white);backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);border-radius:20px;position:relative;overflow:hidden;box-shadow:0 1px 0 var(--rim) inset,1px 0 0 var(--rim2) inset,-1px 0 0 rgba(255,255,255,0.3) inset,0 -1px 0 rgba(0,0,0,0.04) inset,0 8px 32px var(--shadow),0 2px 8px var(--shadow)}
        .glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(135deg,rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.2) 40%,transparent 70%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:10}
        .glass::after{content:'';position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%);border-radius:20px 20px 0 0;pointer-events:none}
        .finput{background:rgba(255,255,255,0.6);border:none;border-radius:11px;padding:13px 16px;font-size:14px;color:var(--ink);font-family:var(--sans);width:100%;outline:none;box-shadow:0 1px 0 rgba(255,255,255,0.9) inset,0 -1px 0 rgba(0,0,0,0.06) inset,0 2px 8px rgba(0,0,0,0.05);transition:box-shadow .2s}
        .finput:focus{box-shadow:0 1px 0 rgba(255,255,255,0.9) inset,0 -1px 0 var(--green-b) inset,0 4px 16px rgba(60,176,67,0.1)}
        .finput::placeholder{color:var(--ink4)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(232,233,236,0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: 'var(--white-hi)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 0 var(--rim) inset, 0 4px 12px var(--shadow2)', position: 'relative', overflow: 'hidden' }}>
            <svg width="18" height="11" viewBox="0 0 24 15" fill="none"><path d="M8.5 7.5C8.5 7.5 6 2 3 2C1.2 2 .5 3.8 .5 7.5C.5 11.2 1.2 13 3 13C6 13 8.5 7.5 8.5 7.5Z" stroke="#3CB043" strokeWidth="1.5" fill="none"/><path d="M15.5 7.5C15.5 7.5 18 2 21 2C22.8 2 23.5 3.8 23.5 7.5C23.5 11.2 22.8 13 21 13C18 13 15.5 7.5 15.5 7.5Z" stroke="#3CB043" strokeWidth="1.5" fill="none"/><path d="M8.5 7.5H15.5" stroke="#3CB043" strokeWidth="1.5"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--ink2)' }}>Infinit <b style={{ fontWeight: 500, color: 'var(--green)' }}>Code</b></span>
        </a>
        <span style={{ fontSize: 12, color: 'var(--ink4)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="15" viewBox="0 0 13 15" fill="none" style={{ opacity: .5 }}><rect x=".5" y="5.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M4 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          Checkout seguro
        </span>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 32, width: '100%', maxWidth: 960, animation: 'fadeUp .5s ease both' }}>

          {/* Left — Order summary */}
          <div className="glass" style={{ padding: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.7)', borderRadius: 100, padding: '5px 14px', fontSize: 11, color: 'var(--ink3)', fontFamily: 'monospace', marginBottom: 28, boxShadow: '0 1px 0 var(--rim) inset, 0 3px 10px var(--shadow)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
              Plano Pro · Cobrança mensal
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 400, lineHeight: 1.1, color: 'var(--ink)', letterSpacing: '-.02em', marginBottom: 8 }}>
              Infinit <em style={{ color: 'var(--ink2)', fontStyle: 'italic' }}>Code</em> Pro
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink3)', lineHeight: 1.6, fontWeight: 300, marginBottom: 36 }}>Claude Code real no seu computador. Sem limite de uso, sem surpresa na fatura.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 22, color: 'var(--ink3)', fontWeight: 300 }}>R$</span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 64, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-.03em', lineHeight: 1 }}>67</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink4)', fontWeight: 300, marginBottom: 4 }}>/ mês · cancele quando quiser</p>
            <p style={{ fontSize: 12, color: 'var(--ink4)', fontFamily: 'monospace', marginBottom: 36 }}>≈ R$2,23/dia · menos que um café</p>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.5)', margin: '0 0 28px' }} />
            <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink4)', fontFamily: 'monospace', marginBottom: 16 }}>O que está incluído</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {INCLUDES.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14, color: 'var(--ink2)', fontWeight: 300 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(60,176,67,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{CHECK_SVG}</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Form */}
          <div className="glass" style={{ padding: 36 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginBottom: 28, letterSpacing: '-.01em' }}>Dados de pagamento</div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--ink4)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 6 }}>Email</div>
                <input className="finput" type="email" placeholder="guilherme@email.com" required />
              </div>
              <div style={{ height: .5, background: 'rgba(255,255,255,0.5)', margin: '4px 0 20px' }} />

              {/* PIX */}
              <button type="button" style={{ width: '100%', background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 11, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 400, color: 'var(--ink2)', cursor: 'pointer', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 3px 10px rgba(0,0,0,0.06)', marginBottom: 20 }}>
                <div style={{ width: 22, height: 22, background: '#32bcad', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.5 7L12 1.5 6.5 7H17.5ZM7 6.5L1.5 12 7 17.5V6.5ZM6.5 17L12 22.5 17.5 17H6.5ZM17 17.5L22.5 12 17 6.5V17.5Z"/></svg>
                </div>
                Pagar com PIX
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 20px' }}>
                <div style={{ flex: 1, height: .5, background: 'rgba(255,255,255,0.6)' }} />
                <span style={{ fontSize: 11, color: 'var(--ink4)', fontFamily: 'monospace' }}>ou cartão</span>
                <div style={{ flex: 1, height: .5, background: 'rgba(255,255,255,0.6)' }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--ink4)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 6 }}>Número do cartão</div>
                <input className="finput" type="text" placeholder="0000  0000  0000  0000" style={{ fontFamily: 'monospace', letterSpacing: '.05em' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--ink4)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 6 }}>Validade</div>
                  <input className="finput" type="text" placeholder="MM/AA" style={{ fontFamily: 'monospace' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--ink4)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 6 }}>CVV</div>
                  <input className="finput" type="text" placeholder="000" style={{ fontFamily: 'monospace' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 11, padding: 16, fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(60,176,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? .8 : 1 }}>
                {loading ? (
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                    <path d="M10 2A8 8 0 0 1 18 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: .8 }}><rect x="1.5" y="7" width="13" height="8" rx="2" stroke="white" strokeWidth="1.4"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    Assinar por R$67/mês
                  </>
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
                {['SSL 256-bit', 'Pagar.me', 'Cancele quando quiser'].map((b) => (
                  <span key={b} style={{ fontSize: 11, color: 'var(--ink4)', fontFamily: 'monospace' }}>{b}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--ink4)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                Ao assinar você concorda com os Termos de Uso e Política de Privacidade.
                Sua chave de licença será enviada por email em até 2 minutos.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(232,233,236,0.6)', backdropFilter: 'blur(12px)' }}>
        <span style={{ fontSize: 11, color: 'var(--ink4)', fontFamily: 'monospace' }}>Infinit Code · Pagamento processado por Pagar.me</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="/" style={{ fontSize: 11, color: 'var(--ink4)', textDecoration: 'none' }}>← Voltar</a>
        </div>
      </footer>
    </>
  );
}
