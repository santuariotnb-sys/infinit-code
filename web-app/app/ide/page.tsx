'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { IDELayout } from '@/components/ide/IDELayout';

export default function IDEPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [licenseOk, setLicenseOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        setLicenseOk(data?.subscription?.status === 'active');
      })
      .catch(() => setLicenseOk(false));
  }, [status]);

  if (status === 'loading' || licenseOk === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        color: '#5A6080',
        flexDirection: 'column',
        gap: 12,
      }}>
        <span style={{ fontSize: 32, color: '#00ff88' }}>∞</span>
        <span>Carregando IDE...</span>
      </div>
    );
  }

  if (!licenseOk) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        color: '#e8e8e8',
        flexDirection: 'column',
        gap: 16,
      }}>
        <span style={{ fontSize: 48 }}>∞</span>
        <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>IDE disponível no plano Pro</h2>
        <p style={{ fontSize: 13, color: '#5A6080', margin: 0 }}>Assine para acessar o editor, preview e terminal.</p>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: '#00ff88',
            color: '#000',
            border: 'none',
            borderRadius: 6,
            padding: '12px 28px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'monospace',
            marginTop: 8,
          }}
        >
          Ver planos →
        </button>
      </div>
    );
  }

  return <IDELayout />;
}
