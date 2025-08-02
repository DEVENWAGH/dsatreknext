'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function ThemeToggleButton({
  showLabel = false,
  variant = 'default',
  start = 'top-left',
  url = null,
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchTheme = () => {
    switch (theme) {
      case 'light':
        setTheme('dark');
        break;
      case 'dark':
        setTheme('light');
        break;
      default:
        break;
    }
  };

  const toggleTheme = () => {
    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    // Apply different transition effects based on variant
    if (variant === 'gif' && url) {
      const root = document.documentElement;
      root.style.setProperty('--transition-gif', `url(${url})`);
    }

    document.startViewTransition(switchTheme);
  };

  const handleClick = e => {
    if (variant === 'circle-blur' || variant === 'circle') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const root = document.documentElement;
      root.style.setProperty('--circle-x', `${x}%`);
      root.style.setProperty('--circle-y', `${y}%`);
    }

    // Add ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: currentColor;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      opacity: 0.3;
    `;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    toggleTheme();
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full relative"
        disabled
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation-duration: 0.5s;
        }

        ::view-transition-old(root) {
          animation-name: fade-out, scale-down;
        }

        ::view-transition-new(root) {
          animation-name: fade-in, scale-up;
        }

        @keyframes fade-out {
          to {
            opacity: 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
        }

        @keyframes scale-down {
          to {
            transform: scale(0.95);
          }
        }

        @keyframes scale-up {
          from {
            transform: scale(0.95);
          }
        }
      `}</style>
      <Button
        onClick={handleClick}
        variant="ghost"
        size="icon"
        className="rounded-full relative overflow-hidden transition-all duration-300 hover:scale-110 hover:bg-accent/50"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
        {showLabel && (
          <span className="ml-2 text-sm transition-all duration-300">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </>
  );
}
