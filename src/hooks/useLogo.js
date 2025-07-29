import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/components/ui/theme-provider';
import { THEME_CONFIG } from '@/utils/constants';

export const useLogo = () => {
  const { theme } = useTheme();
  const [logoSrc, setLogoSrc] = useState(THEME_CONFIG.LIGHT_LOGO);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const computedLogoSrc = useMemo(() => {
    if (!mounted) return THEME_CONFIG.LIGHT_LOGO;

    if (theme === 'light') {
      return THEME_CONFIG.LIGHT_LOGO;
    } else if (theme === 'dark') {
      return THEME_CONFIG.DARK_LOGO;
    } else if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDark ? THEME_CONFIG.DARK_LOGO : THEME_CONFIG.LIGHT_LOGO;
    }
    return THEME_CONFIG.LIGHT_LOGO;
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted && logoSrc !== computedLogoSrc) {
      setLogoSrc(computedLogoSrc);
    }
  }, [computedLogoSrc, logoSrc, mounted]);

  return logoSrc;
};
