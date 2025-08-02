'use client';

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from 'next-themes';

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = 'vite-ui-theme',
  ...props
}) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey={storageKey}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// Re-export useTheme from next-themes for consistency
export const useTheme = () => {
  const context = useNextTheme();

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
