'use client';

import { ThemeProvider } from '@/components/ui/theme-provider';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { SessionProvider } from '@/components/SessionProvider';
import { Toaster } from 'sonner';
import PropTypes from 'prop-types';

export function Providers({ children }) {
  return (
    <NextAuthSessionProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="vite-ui-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    </NextAuthSessionProvider>
  );
}

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};
