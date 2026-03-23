import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: '∞ Infinit Code IDE',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function IDELayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#0a0a0a' }}>
      {children}
    </div>
  );
}
