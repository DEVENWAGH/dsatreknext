'use client';

import { ThemeProvider } from '@/components/ui/theme-provider';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { SessionProvider } from '@/components/SessionProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import PropTypes from 'prop-types';
import { useState } from 'react';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};
