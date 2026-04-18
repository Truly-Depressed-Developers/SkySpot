'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { TRPCProvider } from './TRPCProvider';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from '../ui/sonner';
import { NavbarProvider } from '@/hooks/useNavbar';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TRPCProvider>
        <SessionProvider>
          <NavbarProvider>
            {children}
            <Toaster />
          </NavbarProvider>
        </SessionProvider>
      </TRPCProvider>
    </ThemeProvider>
  );
}
