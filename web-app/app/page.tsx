'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleCTA = () => {
    router.push(session ? '/ide' : '/auth/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e8e8', fontFamily: 'monospace' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,10,.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#00ff88', letterSpacing: 2 }}>∞ Infinit Code</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#features" style={{ color: '#666', fontSize: 12, textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: '#666', fontSize: 12, textDecoration: 'none' }}>Preços</a>
          {session ? (
            <button onClick={() => router.push('/dashboard')} style={{
              background: '#00ff88', color: '#000', border: 'none', borderRadius: 6,
              padding: '8px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
            }}>Dashboard</button>
          ) : (
            <button onClick={() => router.push('/auth/login')} style={{
              background: '#00ff88', color: '#000', border: 'none', borderRadius: 6,
              padding: '8px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
            }}>Entrar</button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 24px 80px',
        maxWidth: 800,
        margin: '0 auto',
      }}>
        <div style={{
          fontSize: 11,
          color: '#00ff88',
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 24,
          background: 'rgba(0,255,136,.06)',
          border: '1px solid rgba(0,255,136,.15)',
          borderRadius: 20,
          padding: '6px 16px',
        }}>
          Web IDE + Claude Code + Deploy
        </div>
        <h1 style={{
          fontSize: 48,
          fontWeight: 700,
          margin: '0 0 20px',
          lineHeight: 1.1,
          letterSpacing: -1,
        }}>
          Code no browser.<br />
          <span style={{ color: '#00ff88' }}>Ship com IA.</span>
        </h1>
        <p style={{
          fontSize: 16,
          color: '#666',
          lineHeight: 1.7,
          margin: '0 0 40px',
          maxWidth: 560,
        }}>
          IDE profissional no browser com editor Monaco, terminal cloud, live preview e Claude Code integrado.
          Sem instalar nada. Sem configurar nada.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleCTA} style={{
            background: '#00ff88', color: '#000', border: 'none', borderRadius: 8,
            padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
          }}>
            Começar agora →
          </button>
          <a href="#features" style={{
            background: 'transparent', color: '#666', border: '1px solid #222', borderRadius: 8,
            padding: '14px 32px', fontSize: 14, cursor: 'pointer', fontFamily: 'monospace',
            textDecoration: 'none', display: 'flex', alignItems: 'center',
          }}>
            Ver features
          </a>
        </div>
      </section>

      {/* IDE Preview mockup */}
      <section style={{
        maxWidth: 900,
        margin: '0 auto 100px',
        padding: '0 24px',
      }}>
        <div style={{
          background: '#0b0f1e',
          border: '1px solid #1c2340',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Title bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: '#0f1428',
            borderBottom: '1px solid #1c2340',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e74c3c' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f1c40f' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff88' }} />
            <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#5A6080' }}>∞ Infinit Code IDE</span>
          </div>
          {/* Fake IDE content */}
          <div style={{ display: 'flex', height: 320 }}>
            {/* Explorer */}
            <div style={{
              width: 180,
              borderRight: '1px solid #1c2340',
              padding: '12px 0',
              fontSize: 11,
              color: '#5A6080',
            }}>
              {['📁 src', '  📄 App.tsx', '  📄 index.css', '📁 components', '  📄 Hero.tsx', '📄 package.json'].map((f, i) => (
                <div key={i} style={{
                  padding: '3px 14px',
                  color: f.includes('App.tsx') ? '#00ff88' : '#5A6080',
                  background: f.includes('App.tsx') ? 'rgba(0,255,136,.06)' : 'transparent',
                }}>{f}</div>
              ))}
            </div>
            {/* Editor */}
            <div style={{ flex: 1, padding: '12px 16px', fontSize: 12, lineHeight: 1.8 }}>
              <div><span style={{ color: '#5B6CF9' }}>import</span> <span style={{ color: '#e8e8e8' }}>{'{ useState }'}</span> <span style={{ color: '#5B6CF9' }}>from</span> <span style={{ color: '#3EEDB0' }}>{`'react'`}</span></div>
              <div><span style={{ color: '#5B6CF9' }}>import</span> <span style={{ color: '#e8e8e8' }}>{'{ Hero }'}</span> <span style={{ color: '#5B6CF9' }}>from</span> <span style={{ color: '#3EEDB0' }}>{`'./Hero'`}</span></div>
              <div style={{ color: '#333' }}>&nbsp;</div>
              <div><span style={{ color: '#5B6CF9' }}>export default function</span> <span style={{ color: '#f1c40f' }}>App</span><span style={{ color: '#e8e8e8' }}>() {'{'}</span></div>
              <div><span style={{ color: '#e8e8e8' }}>&nbsp; </span><span style={{ color: '#5B6CF9' }}>const</span> <span style={{ color: '#e8e8e8' }}>[count, setCount] =</span> <span style={{ color: '#f1c40f' }}>useState</span><span style={{ color: '#e8e8e8' }}>(0)</span></div>
              <div><span style={{ color: '#e8e8e8' }}>&nbsp; </span><span style={{ color: '#5B6CF9' }}>return</span> <span style={{ color: '#e8e8e8' }}>{'<Hero count={count} />'}</span></div>
              <div><span style={{ color: '#e8e8e8' }}>{'}'}</span></div>
            </div>
            {/* Preview */}
            <div style={{
              width: 260,
              borderLeft: '1px solid #1c2340',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                padding: '6px 12px',
                borderBottom: '1px solid #1c2340',
                fontSize: 10,
                color: '#5A6080',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3EEDB0' }} />
                PREVIEW
              </div>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0c18',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>0</div>
                  <div style={{
                    background: '#00ff88',
                    color: '#000',
                    borderRadius: 6,
                    padding: '6px 16px',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}>Incrementar</div>
                </div>
              </div>
            </div>
          </div>
          {/* Terminal bar */}
          <div style={{
            borderTop: '1px solid #1c2340',
            padding: '8px 16px',
            fontSize: 11,
            color: '#5A6080',
            background: '#0a0c18',
          }}>
            <span style={{ color: '#3EEDB0' }}>$</span> claude <span style={{ color: '#00ff88' }}>&#9608;</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 24px 100px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 48,
        }}>
          <div style={{ fontSize: 11, color: '#00ff88', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Features
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            Tudo que você precisa. No browser.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            {
              icon: '{ }',
              title: 'Monaco Editor',
              desc: 'O mesmo editor do VS Code. Syntax highlighting, autocomplete, multi-cursor.',
              color: '#5B6CF9',
            },
            {
              icon: '>_',
              title: 'Terminal Cloud',
              desc: 'Container isolado com Node.js 22. Seu ambiente completo no browser.',
              color: '#3EEDB0',
            },
            {
              icon: '∞',
              title: 'Claude Code',
              desc: 'Claude Code pré-instalado com skills Infinit Code. Use sua própria conta.',
              color: '#00ff88',
            },
            {
              icon: '⟳',
              title: 'Live Preview',
              desc: 'Preview em tempo real. HTML, React, TSX — atualiza enquanto você digita.',
              color: '#f1c40f',
            },
            {
              icon: '⑂',
              title: 'GitHub Sync',
              desc: 'Clone, commit e push direto do IDE. OAuth integrado.',
              color: '#e8e8e8',
            },
            {
              icon: '◇',
              title: 'Snippets',
              desc: 'Biblioteca de code snippets. Busque e insira com um clique.',
              color: '#9b59b6',
            },
          ].map((f) => (
            <div key={f.title} style={{
              background: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: 10,
              padding: '24px 22px',
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: f.color,
                marginBottom: 14,
                fontFamily: 'monospace',
              }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8e8', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 24px 100px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: '#00ff88', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Como funciona
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            3 passos. Zero config.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            { step: '01', title: 'Faça login', desc: 'Google ou GitHub. Sem criar conta.' },
            { step: '02', title: 'Abra o IDE', desc: 'Editor, preview e terminal carregam instantaneamente.' },
            { step: '03', title: 'Conecte o Claude', desc: 'Digite `claude` no terminal. Autentique com sua conta claude.ai. As skills já estão lá.' },
          ].map((s) => (
            <div key={s.step} style={{
              display: 'flex',
              gap: 20,
              alignItems: 'flex-start',
              background: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: 10,
              padding: '20px 24px',
            }}>
              <span style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#00ff88',
                opacity: 0.3,
                lineHeight: 1,
                flexShrink: 0,
              }}>{s.step}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8e8', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{
        maxWidth: 500,
        margin: '0 auto',
        padding: '0 24px 100px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: '#00ff88', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Preço
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            Simples e transparente
          </h2>
        </div>

        <div style={{
          background: '#111',
          border: '1px solid rgba(0,255,136,.2)',
          borderRadius: 12,
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#00ff88', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Pro
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 4 }}>
            R$67<span style={{ fontSize: 16, color: '#666', fontWeight: 400 }}>/mês</span>
          </div>
          <p style={{ fontSize: 12, color: '#666', margin: '8px 0 24px', lineHeight: 1.6 }}>
            Acesso completo ao IDE + container cloud + todas as skills
          </p>
          <div style={{
            textAlign: 'left',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {[
              'Monaco Editor completo',
              'Terminal com Node.js 22',
              'Claude Code pré-instalado',
              '4 skills Infinit Code',
              'GitHub clone/push',
              'Live preview (HTML + React)',
              'Container isolado por usuário',
              'Região São Paulo (gru)',
            ].map((item) => (
              <div key={item} style={{ fontSize: 12, color: '#aaa', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#00ff88', fontSize: 14 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
          <button onClick={handleCTA} style={{
            width: '100%',
            background: '#00ff88',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            padding: '14px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}>
            Assinar Pro →
          </button>
          <p style={{ fontSize: 10, color: '#444', marginTop: 12 }}>
            * IA usa sua própria conta Claude (claude.ai). Custo de IA = zero pro Infinit Code.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1a1a1a',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11,
        color: '#444',
      }}>
        <span>∞ Infinit Code — {new Date().getFullYear()}</span>
        <span>Feito com Claude Code</span>
      </footer>
    </div>
  );
}
