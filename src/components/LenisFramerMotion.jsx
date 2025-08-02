'use client';

import { useRef, useEffect, useCallback } from 'react';
import { ReactLenis } from 'lenis/react';
import { frame, cancelFrame } from 'motion/react';

export default function LenisFramerMotion({ children }) {
  const lenisRef = useRef();

  // Enhanced RAF integration with performance optimization
  useEffect(() => {
    let isActive = true;

    function update(data) {
      if (!isActive) return;

      const time = data.timestamp;
      const lenis = lenisRef.current?.lenis;

      if (lenis) {
        lenis.raf(time);

        // Expose lenis instance globally for scroll utilities
        if (typeof window !== 'undefined') {
          window.lenis = lenis;
        }
      }
    }

    frame.update(update, true);

    return () => {
      isActive = false;
      cancelFrame(update);
      if (typeof window !== 'undefined') {
        window.lenis = null;
      }
    };
  }, []);

  // Enhanced scroll event handling
  const handleScroll = useCallback(e => {
    // Custom scroll event handling if needed
    const scrollProgress = e.scroll / (e.limit || 1);

    // Dispatch custom scroll event for components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lenisScroll', {
          detail: {
            scroll: e.scroll,
            limit: e.limit,
            velocity: e.velocity,
            direction: e.direction,
            progress: scrollProgress,
          },
        })
      );
    }
  }, []);

  // Optimized Lenis configuration
  const options = {
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
    wheelMultiplier: 1,
    infinite: false,
    autoRaf: false,
    syncTouch: false,
    syncTouchLerp: 0.075,
    touchInertiaMultiplier: 35,
    orientation: 'vertical',
    lerp: 0.1,
    normalizeWheel: true,
    onScroll: handleScroll,
  };

  return (
    <ReactLenis root options={options} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
