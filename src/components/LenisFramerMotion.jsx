'use client';

import { useRef, useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import { frame, cancelFrame } from 'motion/react';

export default function LenisFramerMotion({ children }) {
  const lenisRef = useRef();

  useEffect(() => {
    function update(data) {
      const time = data.timestamp;
      lenisRef.current?.lenis?.raf(time);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, []);

  const options = {
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
    autoRaf: false,
  };

  return (
    <ReactLenis root options={options} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
