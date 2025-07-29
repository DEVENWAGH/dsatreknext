'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  useIsClient,
  useLocalStorage,
  useMediaQuery,
} from '@/hooks/useIsClient';

// Helper function to resolve theme to actual light/dark value
export const getResolvedTheme = (theme, isDarkSystem) => {
  if (theme === 'system') {
    return isDarkSystem ? 'dark' : 'light';
  }
  return theme;
};

const initialState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}) {
  const isClient = useIsClient();
  const [storedTheme, setStoredTheme] = useLocalStorage(
    storageKey,
    defaultTheme
  );
  const [theme, setTheme] = useState(defaultTheme);
  const isDarkSystem = useMediaQuery('(prefers-color-scheme: dark)');

  // Initialize theme from localStorage
  useEffect(() => {
    if (isClient && storedTheme) {
      setTheme(storedTheme);
    }
  }, [isClient, storedTheme]);

  useEffect(() => {
    if (!isClient) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = isDarkSystem ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, isDarkSystem, isClient]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: newTheme => {
        setStoredTheme(newTheme);
        setTheme(newTheme);
      },
    }),
    [theme, setStoredTheme]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  const isDarkSystem = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedTheme = getResolvedTheme(context.theme, isDarkSystem);

  return {
    ...context,
    resolvedTheme, // Add resolved theme to the context
  };
};
