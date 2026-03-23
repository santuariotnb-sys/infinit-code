import type { Metadata } from 'next';
import { SessionProvider2 } from './providers';

export const metadata: Metadata = {
  title: 'Infinit Code — Do prompt ao deploy. Sem paradas.',
  description: 'O primeiro IDE feito para IA. Editor Monaco, terminal Linux, live preview e Claude Code nativo. Abra o browser e comece a criar.',
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
