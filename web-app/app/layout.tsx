import type { Metadata } from 'next';
import { SessionProvider2 } from './providers';

export const metadata: Metadata = {
  title: 'Infinit Code',
  description: 'Saia da Lovable. Código profissional com Claude Code.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: '#0a0a0a' }}>
        <SessionProvider2>{children}</SessionProvider2>
      </body>
    </html>
  );
}
