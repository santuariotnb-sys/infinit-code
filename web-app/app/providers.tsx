'use client';
import { SessionProvider } from 'next-auth/react';

export function SessionProvider2({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
