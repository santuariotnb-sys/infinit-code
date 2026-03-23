'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.028'/%3E%3C/svg%3E")`;

const LOGO_SVG = (
  <svg width="18" height="11" viewBox="0 0 24 15" fill="none">
    <path d="M8.5 7.5C8.5 7.5 6 2 3 2C1.2 2 .5 3.8 .5 7.5C.5 11.2 1.2 13 3 13C6 13 8.5 7.5 8.5 7.5Z" stroke="#3CB043" strokeWidth="1.5" fill="none"/>
    <path d="M15.5 7.5C15.5 7.5 18 2 21 2C22.8 2 23.5 3.8 23.5 7.5C23.5 11.2 22.8 13 21 13C18 13 15.5 7.5 15.5 7.5Z" stroke="#3CB043" strokeWidth="1.5" fill="none"/>
    <path d="M8.5 7.5H15.5" stroke="#3CB043" strokeWidth="1.5"/>
    <path d="M18.5 4.5L21.5 7L18 10.5" stroke="#3CB043" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
  </svg>
);

const FEATURES = [
  { icon: '⚡', title: 'Preview ao Vivo', desc: 'Vê o resultado na hora que o Claude escreve. HTML, CSS, React — tudo em tempo real sem recarregar.', badge: 'PRO' },
  { icon: '🤖', title: 'Claude Code Real', desc: 'Não uma API genérica. O Claude Code oficial rodando no seu terminal, com acesso total ao projeto.', badge: 'PRO' },
  { icon: '🎙️', title: 'Voz em PT-BR', desc: 'Fala em português, o Claude entende e constrói. O único IDE com /voice nativo em português.', badge: 'PRO' },
  { icon: '🔧', title: 'Setup Zero', desc: 'Node.js, Git, Claude Code e as Skills do Infinit — instalados automaticamente em 2 minutos.', badge: '' },
  { icon: '🐙', title: 'GitHub Integrado', desc: 'OAuth local, push, pull e sync direto do app. Seu código fica no seu repositório.', badge: '' },
  { icon: '🔑', title: 'Licença Simples', desc: 'R$67/mês. Sem crédito, sem limite de uso, sem surpresa na fatura. Cancela quando quiser.', badge: 'PRO' },
];

const STEPS = [
  { n: '01', title: 'Baixa e instala', desc: 'Abre o .dmg ou .exe e arrasta para Applications. Sem terminal, sem npm, sem configuração.', active: false },
  { n: '02', title: 'Setup automático', desc: 'Node.js, Git, Claude Code e as 6 Skills do Infinit são instalados sozinhos. Você só assiste.', active: true },
  { n: '03', title: 'Ativa a licença', desc: 'Cola a chave INFT-XXXX que chegou por email. Um clique e está dentro.', active: false },
  { n: '04', title: 'Começa a codar', desc: 'Abre um projeto, abre o chat, descreve o que quer. O Claude constrói. Você lança.', active: false },
];

export default function LandingPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mainRef} style={{ background: '#e8e9ec', backgroundImage: NOISE, fontFamily: "'DM Sans', sans-serif", color: '#1a1c20', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        @keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .glass{background:rgba(255,255,255,0.55);backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);border-radius:20px;position:relative;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,0.85) inset,1px 0 0 rgba(255,255,255,0.5) inset,-1px 0 0 rgba(255,255,255,0.3) inset,0 -1px 0 rgba(0,0,0,0.04) inset,0 8px 32px rgba(0,0,0,0.08),0 2px 8px rgba(0,0,0,0.08)}
        .glass::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(135deg,rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.2) 40%,transparent 70%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:10}
        .glass::after{content:'';position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%);border-radius:20px 20px 0 0;pointer-events:none}
        .reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
        .reveal.visible{opacity:1;transform:none}
        .feat-card:hover{transform:translateY(-3px)}
        .step-card:hover{transform:translateX(4px)}
        .blink{display:inline-block;width:1.5px;height:11px;background:#3CB043;animation:blink 1s steps(1) infinite;vertical-align:middle}
        .spin{animation:spin 1.4s linear infinite}
        .pulse-dot{width:6px;height:6px;border-radius:50%;background:#3CB043;animation:pulse 2s ease-in-out infinite}
        @keyframes heroIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hero-anim-1{animation:heroIn .6s ease both}
        .hero-anim-2{animation:heroIn .6s .1s ease both}
        .hero-anim-3{animation:heroIn .6s .15s ease both}
        .hero-anim-4{animation:heroIn .6s .2s ease both}
        .hero-anim-5{animation:heroIn .6s .25s ease both}
        .hero-anim-6{animation:heroIn .8s .35s ease both}
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(232,233,236,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.72)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 0 4px 12px rgba(0,0,0,0.14)', position: 'relative', overflow: 'hidden' }}>
            {LOGO_SVG}
          </div>
          <span style={{ fontSize: 15, fontWeight: 400, color: '#4a4d55' }}>Infinit <b style={{ fontWeight: 500, color: '#3CB043' }}>Code</b></span>
        </div>
        <ul style={{ display: 'flex', alignItems: 'center', gap: 32, listStyle: 'none' }}>
          {['Recursos', 'Como funciona', 'Preço', 'Baixar'].map((l, i) => (
            <li key={l}><a href={['#recursos','#como-funciona','#preco','#baixar'][i]} style={{ fontSize: 13, color: '#8a8d96', textDecoration: 'none' }}>{l}</a></li>
          ))}
        </ul>
        <button onClick={() => router.push('/checkout')} style={{ background: '#1a1c20', color: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          Instalar grátis →
        </button>
      </nav>

      {/* HERO */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 40px 80px' }}>
        <div className="hero-anim-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', borderRadius: 100, padding: '6px 16px', fontSize: 12, color: '#8a8d96', fontFamily: "'JetBrains Mono', monospace", marginBottom: 36, boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 0 4px 16px rgba(0,0,0,0.08)' }}>
          <div className="pulse-dot" />
          Claude Code nativo · Disponível agora
        </div>

        <h1 className="hero-anim-2" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(52px, 7vw, 90px)', fontWeight: 400, lineHeight: 1.05, color: '#1a1c20', letterSpacing: '-.02em', marginBottom: 8 }}>
          Descreva. O Claude<br/><span style={{ color: '#3CB043', fontStyle: 'italic' }}>Code</span> constrói.
        </h1>
        <h2 className="hero-anim-3" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, lineHeight: 1.1, color: '#4a4d55', fontStyle: 'italic', letterSpacing: '-.01em', marginBottom: 28 }}>
          Você lança.
        </h2>

        <p className="hero-anim-4" style={{ fontSize: 17, color: '#8a8d96', maxWidth: 480, lineHeight: 1.65, marginBottom: 48, fontWeight: 300 }}>
          O único IDE desktop com Claude Code real integrado. Setup automático, preview ao vivo, e tudo em português. Do zero ao ar em 2 minutos.
        </p>

        <div className="hero-anim-5" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 72 }}>
          <button onClick={() => router.push('/download')} style={{ background: '#3CB043', color: 'white', border: 'none', borderRadius: 11, padding: '14px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(60,176,67,0.25)', letterSpacing: '-.01em' }}>
            ↓ Baixar grátis — Mac, Windows
          </button>
          <button onClick={() => router.push('/checkout')} style={{ background: 'rgba(255,255,255,0.72)', color: '#4a4d55', border: 'none', borderRadius: 11, padding: '14px 24px', fontSize: 15, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 0 4px 16px rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)' }}>
            Ver recursos Pro
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace" }}>Sem cartão de crédito · Cancela quando quiser</p>

        {/* IDE Mockup */}
        <div className="hero-anim-6" style={{ width: '100%', maxWidth: 820, marginTop: 60 }}>
          <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 1px 0 0 rgba(255,255,255,0.5) inset, 0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)', position: 'relative' }}>
            {/* Title bar */}
            <div style={{ background: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.5)', height: 40, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF6159','#FEBC30','#28CB41'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.5)', borderRadius: 6, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", maxWidth: 280, margin: '0 auto' }}>~/Desktop/meu-projeto — Infinit Code</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[{l:'Git',g:false},{l:'● :3000',g:true}].map((b) => (
                  <div key={b.l} style={{ background: b.g ? 'rgba(60,176,67,0.12)' : 'rgba(255,255,255,0.5)', borderRadius: 5, padding: '3px 10px', fontSize: 10, color: b.g ? '#3CB043' : '#8a8d96', fontFamily: "'JetBrains Mono', monospace", boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset' }}>{b.l}</div>
                ))}
              </div>
            </div>
            {/* Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 220px', height: 220 }}>
              {/* File tree */}
              <div style={{ background: 'rgba(255,255,255,0.25)', borderRight: '1px solid rgba(255,255,255,0.4)', padding: '10px 0' }}>
                {[{h:true,label:'src'},{file:'page.tsx',on:true},{file:'layout.tsx'},{file:'globals.css',dot:true},{h:true,label:'components'},{file:'Hero.tsx'},{file:'Pricing.tsx',dot:true},{h:true,label:'claude',green:true},{file:'CLAUDE.md',g:true}].map((item, i) => (
                  item.h ? (
                    <div key={i} style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: item.green ? '#3CB043' : '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", padding: '5px 14px 3px', display: 'flex', alignItems: 'center', gap: 5, marginTop: i > 0 ? 8 : 0 }}>
                      {item.green && <div className="pulse-dot" />}{item.label}
                    </div>
                  ) : (
                    <div key={i} style={{ padding: '4px 14px', fontSize: 11, color: item.on ? '#1a1c20' : (item.g ? 'rgba(60,176,67,0.6)' : '#8a8d96'), fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 7, background: item.on ? 'rgba(255,255,255,0.4)' : 'transparent' }}>
                      {item.dot && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#3CB043', flexShrink: 0 }} />}{item.file}
                    </div>
                  )
                ))}
              </div>
              {/* Editor */}
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 18px', overflow: 'hidden' }}>
                {[
                  [`1`, <><span style={{color:'#8a8d96',fontStyle:'italic'}}>// app/page.tsx</span></>],
                  [`2`, <><span style={{color:'#7c5cbf'}}>import</span> <span style={{color:'#357abd'}}>Hero</span> <span style={{color:'#7c5cbf'}}>from</span> <span style={{color:'#3CB043'}}>'@/components/Hero'</span></>],
                  [`3`, <><span style={{color:'#7c5cbf'}}>import</span> <span style={{color:'#357abd'}}>Pricing</span> <span style={{color:'#7c5cbf'}}>from</span> <span style={{color:'#3CB043'}}>'@/components/Pricing'</span></>],
                  [`4`, ``],
                  [`5`, <><span style={{color:'#7c5cbf'}}>export default function</span> <span style={{color:'#357abd'}}>Home</span>() {'{'}</>],
                  [`6`, <>&nbsp; <span style={{color:'#7c5cbf'}}>return</span> (</>],
                  [`7`, <>&nbsp;&nbsp;&nbsp; &lt;<span style={{color:'#357abd'}}>main</span> <span style={{color:'#7c5cbf'}}>className</span>=<span style={{color:'#3CB043'}}>"min-h-screen"</span>&gt;</>],
                  [`8`, <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;<span style={{color:'#357abd'}}>Hero</span> <span style={{color:'#7c5cbf'}}>title</span>=<span style={{color:'#3CB043'}}>"Infinit Code"</span> /&gt;</>],
                  [`9`, <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;<span style={{color:'#357abd'}}>Pricing</span> /&gt;</>],
                ].map(([n, code]) => (
                  <div key={String(n)} style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.75, whiteSpace: 'pre' }}>
                    <span style={{ color: '#b0b3bc', display: 'inline-block', width: 18, textAlign: 'right', marginRight: 14, fontSize: 10 }}>{n}</span>
                    <span>{code}</span>
                  </div>
                ))}
              </div>
              {/* Chat */}
              <div style={{ background: 'rgba(255,255,255,0.3)', borderLeft: '1px solid rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.4)', padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4a4d55', fontWeight: 300 }}>
                  <div className="pulse-dot" />
                  Infinit <b style={{ color: '#3CB043', fontWeight: 500 }}>Code</b>
                </div>
                <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
                  <div style={{ fontSize: 11, color: '#4a4d55', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>Crie uma seção de pricing com 3 planos.</div>
                  <div style={{ alignSelf: 'flex-end', background: 'rgba(255,255,255,0.6)', borderRadius: '9px 9px 3px 9px', padding: '7px 10px', maxWidth: '90%', fontSize: 11, color: '#1a1c20', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 6px rgba(0,0,0,0.06)' }}>
                    criando agora<span className="blink" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 7, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset' }}>
                    <svg width="9" height="11" viewBox="0 0 8 10" fill="none"><path d="M1 1h4l2 2v6H1z" stroke="rgba(60,176,67,0.5)" strokeWidth=".8" fill="none"/></svg>
                    <span style={{ fontSize: 10, color: '#3CB043', fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>Pricing.tsx</span>
                    <span style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 4, padding: '2px 8px', fontSize: 9, color: '#8a8d96', fontFamily: "'JetBrains Mono', monospace" }}>abrir</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#4a4d55', fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>Pronto. Preview em <span style={{ color: '#3CB043' }}>:3000</span></div>
                </div>
                <div style={{ padding: '9px 11px', borderTop: '1px solid rgba(255,255,255,0.4)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 11px', fontSize: 11, color: '#b0b3bc', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset' }}>O que quer construir...</div>
                </div>
              </div>
            </div>
            {/* Terminal */}
            <div style={{ gridColumn: '1 / -1', background: 'rgba(26,28,32,0.88)', borderTop: '1px solid rgba(255,255,255,0.1)', height: 34, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, borderRadius: '0 0 17px 17px' }}>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.3)' }}><b style={{ color: '#3CB043' }}>●</b> TERMINAL</span>
              <div style={{ width: .5, height: 13, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.45)' }}>$ claude --dangerously-skip-permissions<span style={{ display: 'inline-block', width: 6, height: 11, background: '#3CB043', opacity: .5, animation: 'blink 1s steps(1) infinite', verticalAlign: 'middle' }} /></span>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(60,176,67,0.4)' }}>Claude Code v1.0.9</span>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.5)', margin: '0 40px' }} />

      {/* FEATURES */}
      <section id="recursos" style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#8a8d96', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            <span style={{ color: '#3CB043', fontWeight: 500 }}>//</span> Recursos
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(38px, 4vw, 58px)', fontWeight: 400, lineHeight: 1.1, color: '#1a1c20', letterSpacing: '-.02em', marginBottom: 16 }}>
            Tudo que você precisa<br/><em style={{ color: '#4a4d55', fontStyle: 'italic' }}>para entregar mais rápido.</em>
          </h2>
          <p style={{ fontSize: 16, color: '#8a8d96', lineHeight: 1.65, fontWeight: 300, maxWidth: 480 }}>
            Não é só um editor. É o Claude trabalhando junto com você, em tempo real, no seu computador.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 64 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`glass feat-card reveal`} style={{ padding: '28px 26px 26px', transition: 'transform .2s', transitionDelay: `${i * 0.08}s` }}>
              <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 18, boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 3px 10px rgba(0,0,0,0.07)', position: 'relative', zIndex: 1 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#1a1c20', marginBottom: 8, letterSpacing: '-.01em', position: 'relative', zIndex: 1 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#8a8d96', lineHeight: 1.6, fontWeight: 300, position: 'relative', zIndex: 1 }}>{f.desc}</div>
              {f.badge && <div style={{ display: 'inline-block', marginTop: 12, background: 'rgba(60,176,67,0.12)', borderRadius: 4, padding: '2px 9px', fontSize: 10, color: '#3CB043', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, position: 'relative', zIndex: 1 }}>{f.badge}</div>}
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.5)', margin: '0 40px' }} />

      {/* HOW IT WORKS */}
      <section id="como-funciona" style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#8a8d96', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            <span style={{ color: '#3CB043', fontWeight: 500 }}>//</span> Como funciona
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(38px, 4vw, 58px)', fontWeight: 400, lineHeight: 1.1, color: '#1a1c20', letterSpacing: '-.02em', marginBottom: 16 }}>
            No ar em<br/><em style={{ color: '#4a4d55', fontStyle: 'italic' }}>minutos.</em>
          </h2>
          <p style={{ fontSize: 16, color: '#8a8d96', lineHeight: 1.65, fontWeight: 300, maxWidth: 480 }}>
            Instala, ativa, e o Infinit Code cuida do resto. Você só precisa do seu email do claude.ai.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40, marginTop: 64, alignItems: 'center' }}>
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12, transitionDelay: '.1s' }}>
            {STEPS.map((s) => (
              <div key={s.n} className="glass step-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 22px', transition: 'transform .2s' }}>
                <div style={{ width: 32, height: 32, background: s.active ? 'rgba(60,176,67,0.12)' : 'rgba(255,255,255,0.7)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: s.active ? '#3CB043' : '#8a8d96', flexShrink: 0, boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 2px 6px rgba(0,0,0,0.06)', position: 'relative', zIndex: 1 }}>{s.n}</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1c20', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#8a8d96', lineHeight: 1.55, fontWeight: 300 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="glass reveal" style={{ padding: 32, transitionDelay: '.2s' }}>
            <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.7)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 4px 12px rgba(0,0,0,0.07)' }}>
                  <svg width="22" height="14" viewBox="0 0 24 15" fill="none">
                    <path d="M8.5 7.5C8.5 7.5 6 2 3 2C1.2 2 .5 3.8 .5 7.5C.5 11.2 1.2 13 3 13C6 13 8.5 7.5 8.5 7.5Z" stroke="#3CB043" strokeWidth="1.4" fill="none"/>
                    <path d="M15.5 7.5C15.5 7.5 18 2 21 2C22.8 2 23.5 3.8 23.5 7.5C23.5 11.2 22.8 13 21 13C18 13 15.5 7.5 15.5 7.5Z" stroke="#3CB043" strokeWidth="1.4" fill="none"/>
                    <path d="M8.5 7.5H15.5" stroke="#3CB043" strokeWidth="1.4"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 300, color: '#4a4d55', fontFamily: "'DM Sans', sans-serif" }}>Infinit <b style={{ fontWeight: 500, color: '#3CB043' }}>Code</b></div>
                  <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace" }}>Configurando...</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
              {[
                { name: 'Node.js', status: 'v22.13 detectado', ok: true, active: false, dim: false },
                { name: 'Git', status: 'v2.44 detectado', ok: true, active: false, dim: false },
                { name: 'Claude Code', status: 'instalando...', ok: false, active: true, dim: false },
                { name: 'Skills Infinit', status: 'aguardando', ok: false, active: false, dim: true },
                { name: 'Configurações PT-BR', status: 'aguardando', ok: false, active: false, dim: true },
              ].map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 11, background: item.dim ? 'transparent' : item.active ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.5)', boxShadow: item.dim ? 'none' : item.active ? '0 1px 0 rgba(255,255,255,0.95) inset, 0 4px 14px rgba(0,0,0,0.08)' : '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 6px rgba(0,0,0,0.05)', backdropFilter: item.dim ? 'none' : 'blur(12px)', opacity: item.dim ? 0.4 : 1 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.ok ? 'rgba(60,176,67,0.12)' : 'rgba(255,255,255,0.6)', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset', flexShrink: 0 }}>
                    {item.ok ? (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#3CB043" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    ) : item.active ? (
                      <svg className="spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke="rgba(100,110,130,0.2)" strokeWidth="1.5" fill="none"/>
                        <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" stroke="#8a8d96" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                      </svg>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 13, color: item.active ? '#1a1c20' : '#4a4d55', flex: 1, fontWeight: 300 }}>
                    {item.name === 'Claude Code' ? <>Claude <b style={{ fontWeight: 500, color: '#3CB043' }}>Code</b></> : item.name}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: item.ok ? '#3CB043' : '#b0b3bc' }}>{item.status}</div>
                </div>
              ))}
              <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: 100, height: 2, margin: '12px 0 6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: '#3CB043', opacity: .6, borderRadius: 100 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace" }}>npm install -g @anthropic-ai/claude-code</span>
                <span style={{ fontSize: 10, color: '#3CB043', fontFamily: "'JetBrains Mono', monospace", opacity: .7 }}>60%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.5)', margin: '0 40px' }} />

      {/* LICENSE SECTION */}
      <div style={{ padding: '80px 40px', background: '#dfe0e4', backgroundImage: NOISE }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div className="reveal">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#8a8d96', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              <span style={{ color: '#3CB043', fontWeight: 500 }}>//</span> Ativação da Licença
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(38px, 4vw, 58px)', fontWeight: 400, lineHeight: 1.1, color: '#1a1c20', letterSpacing: '-.02em', marginBottom: 16 }}>
              Uma chave.<br/><em style={{ color: '#4a4d55', fontStyle: 'italic' }}>Tudo liberado.</em>
            </h2>
            <p style={{ fontSize: 16, color: '#8a8d96', lineHeight: 1.65, fontWeight: 300, maxWidth: 480 }}>
              Após a compra, sua chave chega por email. Cola na tela de ativação do app — e o Infinit Code libera todos os recursos Pro na hora.
            </p>
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#8a8d96' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#3CB043" strokeWidth="1.2"/><path d="M4.5 7L6.5 9L9.5 5" stroke="#3CB043" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Pro + Ativo · 1 device
              </div>
            </div>
          </div>
          <div className="glass reveal" style={{ padding: 36, textAlign: 'center', transitionDelay: '.15s' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 300, color: '#4a4d55', letterSpacing: '.1em', marginBottom: 16, position: 'relative', zIndex: 1 }}>
              INFT-<span style={{ color: '#3CB043', fontWeight: 500 }}>XXXX</span>-XXXX-<span style={{ color: '#3CB043', fontWeight: 500 }}>XXXX</span>-XXXX
            </div>
            <div style={{ fontSize: 12, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", position: 'relative', zIndex: 1 }}>Chave entregue por email após a compra</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(60,176,67,0.12)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: '#3CB043', fontFamily: "'JetBrains Mono', monospace", marginTop: 14, position: 'relative', zIndex: 1 }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#3CB043" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Pro · Ativo · 1 device
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <section id="preco" style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#8a8d96', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            <span style={{ color: '#3CB043', fontWeight: 500 }}>//</span> Preço
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(38px, 4vw, 58px)', fontWeight: 400, lineHeight: 1.1, color: '#1a1c20', letterSpacing: '-.02em', marginBottom: 16 }}>
            Preço<br/><em style={{ color: '#4a4d55', fontStyle: 'italic' }}>simples.</em>
          </h2>
          <p style={{ fontSize: 16, color: '#8a8d96', lineHeight: 1.65, fontWeight: 300, maxWidth: 480 }}>
            Sem crédito, sem limite de uso. Pague mensalmente em reais, cancele quando quiser.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 64 }}>
          {/* Free */}
          <div className="glass reveal" style={{ padding: '36px 32px', transitionDelay: '.1s' }}>
            <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14, position: 'relative', zIndex: 1 }}>Free</div>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, marginBottom: 8, position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 58, fontWeight: 400, color: '#1a1c20', lineHeight: 1, letterSpacing: '-.03em' }}><span style={{ fontSize: 24, color: '#8a8d96' }}>R$</span>0</div>
            </div>
            <p style={{ fontSize: 13, color: '#b0b3bc', fontWeight: 300, marginBottom: 12, position: 'relative', zIndex: 1 }}>para sempre</p>
            <p style={{ fontSize: 13, color: '#8a8d96', marginBottom: 28, lineHeight: 1.55, fontWeight: 300, position: 'relative', zIndex: 1 }}>Para experimentar o app e ver se é o que você precisa.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, position: 'relative', zIndex: 1 }}>
              {['Setup automático','Editor Monaco','Claude Code integrado','Preview ao vivo','Voz PT-BR','Skills Infinit'].map((item, i) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 300, color: i >= 2 ? '#b0b3bc' : '#4a4d55' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: i >= 2 ? 'rgba(0,0,0,0.06)' : 'rgba(60,176,67,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {i < 2 && <svg viewBox="0 0 10 8" fill="none" width="10" height="8"><path d="M1 4L3.5 6.5L9 1" stroke="#3CB043" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push('/download')} style={{ width: '100%', border: 'none', borderRadius: 11, padding: 14, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', background: '#1a1c20', color: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', position: 'relative', zIndex: 1 }}>
              Instalar grátis →
            </button>
          </div>
          {/* Pro */}
          <div className="glass reveal" style={{ padding: '36px 32px', position: 'relative', transitionDelay: '.2s', background: 'rgba(255,255,255,0.72)', boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 1px 0 0 rgba(255,255,255,0.7) inset, 0 20px 60px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'absolute', top: 20, right: 20, background: '#3CB043', color: 'white', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", zIndex: 2 }}>Mais popular</div>
            <div style={{ fontSize: 11, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14, position: 'relative', zIndex: 1 }}>Pro</div>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, marginBottom: 8, position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 58, fontWeight: 400, color: '#1a1c20', lineHeight: 1, letterSpacing: '-.03em' }}><span style={{ fontSize: 24, color: '#8a8d96' }}>R$</span>67</div>
            </div>
            <p style={{ fontSize: 13, color: '#b0b3bc', fontWeight: 300, marginBottom: 12, position: 'relative', zIndex: 1 }}>/ mês · sem crédito · sem surpresa</p>
            <p style={{ fontSize: 13, color: '#8a8d96', marginBottom: 28, lineHeight: 1.55, fontWeight: 300, position: 'relative', zIndex: 1 }}>Para quem quer construir de verdade, sem limite e sem ansiedade de token.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, position: 'relative', zIndex: 1 }}>
              {['Tudo do Free','Claude Code integrado','Preview ao vivo em tempo real','Voz em PT-BR (/voice)','6 Skills Infinit pré-instaladas','GitHub OAuth local','Suporte prioritário'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 300, color: '#4a4d55' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(60,176,67,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 10 8" fill="none" width="10" height="8"><path d="M1 4L3.5 6.5L9 1" stroke="#3CB043" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push('/checkout')} style={{ width: '100%', border: 'none', borderRadius: 11, padding: 14, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', background: '#3CB043', color: 'white', boxShadow: '0 4px 20px rgba(60,176,67,0.25)', position: 'relative', zIndex: 1 }}>
              Assinar Pro — R$67/mês →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="baixar" style={{ borderTop: '1px solid rgba(255,255,255,0.5)', padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(232,233,236,0.8)', backdropFilter: 'blur(12px)' }}>
        <div style={{ fontSize: 12, color: '#b0b3bc', fontFamily: "'JetBrains Mono', monospace" }}>
          Feito com ❤️ no Brasil · <a href="mailto:suporte@infinitcode.app" style={{ color: '#3CB043', textDecoration: 'none' }}>suporte@infinitcode.app</a>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Termos','Privacidade','Documentação','Baixar'].map((l) => (
            <a key={l} href={l === 'Baixar' ? '/download' : '#'} style={{ fontSize: 12, color: '#b0b3bc', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
