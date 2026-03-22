import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '∞ Infinit Code IDE',
};

export default function IDELayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      {children}
    </div>
  );
}
