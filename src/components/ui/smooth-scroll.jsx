'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ReactLenis } from 'lenis/react';

/**
 * A component that adds smooth scrolling to any element
 */
export function SmoothScroll({ children, className, ...props }) {
  const options = {
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  };

  return (
    <ReactLenis
      className={cn('overflow-auto', className)}
      options={options}
      {...props}
    >
      {children}
    </ReactLenis>
  );
}
