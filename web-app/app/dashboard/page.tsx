'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const justActivated = searchParams.get('activated') === '1';

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/dashboard').then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#555' }}>
        <span style={{ color: '#00ff88' }}>∞</span>&nbsp;Carregando...
      </div>
    );
  }

  if (!session) return null;

  const isPro = data?.subscription?.status === 'active';
  const githubConnected = (session as any)?.githubConnected;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e8e8', fontFamily: 'monospace' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          borderBottom: '1px solid #1a1a1a',
          marginBottom: 32,
        }}>
          <div
            onClick={() => router.push('/')}
            style={{ fontSize: 16, fontWeight: 700, color: '#00ff88', letterSpacing: 2, cursor: 'pointer' }}
          >
            ∞ Infinit Code
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#555' }}>{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                background: 'none',
                border: '1px solid #222',
                borderRadius: 4,
                color: '#555',
                fontSize: 11,
                padding: '4px 12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Sair
            </button>
          </div>
        </header>

        {/* Activation banner */}
        {justActivated && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 24,
            background: 'rgba(0,255,136,.08)',
            border: '1px solid rgba(0,255,136,.2)',
            color: '#00ff88',
          }}>
            Pagamento confirmado! Seu plano Pro está ativo.
          </div>
        )}

        {/* CTA: Open IDE */}
        <section style={{
          background: isPro ? 'rgba(0,255,136,.04)' : '#111',
          border: `1px solid ${isPro ? 'rgba(0,255,136,.15)' : '#1a1a1a'}`,
          borderRadius: 12,
          padding: 'clamp(16px, 4vw, 32px)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>
              {isPro ? 'Seu IDE está pronto' : 'Comece a codar no browser'}
            </h2>
            <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}>
              {isPro
                ? 'Editor Monaco, terminal cloud e Claude Code integrado.'
                : 'Assine o plano Pro para acessar o IDE completo.'}
            </p>
          </div>
          <button
            onClick={() => isPro ? router.push('/ide') : router.push('/#pricing')}
            style={{
              background: '#00ff88',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              padding: '14px 28px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {isPro ? 'Abrir IDE →' : 'Assinar Pro →'}
          </button>
        </section>

        {/* Status cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          <StatusCard
            label="Plano"
            value={isPro ? 'Pro' : 'Free'}
            color={isPro ? '#00ff88' : '#555'}
          />
          <StatusCard
            label="Status"
            value={isPro ? 'Ativa' : 'Sem assinatura'}
            color={isPro ? '#00ff88' : '#555'}
          />
          <StatusCard
            label="Renova em"
            value={data?.subscription?.currentPeriodEnd
              ? new Date(data.subscription.currentPeriodEnd).toLocaleDateString('pt-BR')
              : '—'}
            color="#e8e8e8"
          />
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 32 }}>
          <ActionCard
            icon=">_"
            title="Terminal Cloud"
            desc="Container isolado com Node.js 22 na região São Paulo"
            status={isPro ? 'Disponível' : 'Pro'}
            statusColor={isPro ? '#3EEDB0' : '#555'}
          />
          <ActionCard
            icon="⑂"
            title="GitHub"
            desc={githubConnected ? 'Conectado — clone e push integrados' : 'Conecte para clonar e fazer push'}
            status={githubConnected ? 'Conectado' : 'Não conectado'}
            statusColor={githubConnected ? '#3EEDB0' : '#f1c40f'}
          />
        </div>

        {/* Features included */}
        <section>
          <div style={{ fontSize: 11, color: '#555', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
            Incluído no {isPro ? 'seu plano' : 'Pro'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {[
              { icon: '{ }', title: 'Monaco Editor', desc: 'Syntax highlighting, autocomplete, multi-cursor', color: '#5B6CF9' },
              { icon: '∞', title: 'Claude Code', desc: '4 skills pré-instaladas no terminal', color: '#00ff88' },
              { icon: '⟳', title: 'Live Preview', desc: 'HTML e React em tempo real', color: '#f1c40f' },
              { icon: '>_', title: 'Terminal', desc: 'Node.js 22 + container isolado', color: '#3EEDB0' },
              { icon: '⑂', title: 'GitHub Sync', desc: 'Clone, commit e push integrados', color: '#e8e8e8' },
              { icon: '◇', title: 'Snippets', desc: 'Biblioteca de code snippets', color: '#9b59b6' },
            ].map((f) => (
              <div key={f.title} style={{
                background: '#111',
                border: '1px solid #1a1a1a',
                borderRadius: 8,
                padding: '16px 18px',
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: f.color, marginBottom: 8, fontFamily: 'monospace' }}>{f.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#e8e8e8', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: '16px 20px' }}>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 500, color }}>{value}</div>
    </div>
  );
}

function ActionCard({ icon, title, desc, status, statusColor }: {
  icon: string; title: string; desc: string; status: string; statusColor: string;
}) {
  return (
    <div style={{
      background: '#111',
      border: '1px solid #1a1a1a',
      borderRadius: 10,
      padding: '20px 22px',
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#5A6080', fontFamily: 'monospace', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6, marginBottom: 8 }}>{desc}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
          <span style={{ fontSize: 10, color: statusColor }}>{status}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff88', fontFamily: 'monospace' }}>
        ∞ Carregando...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
