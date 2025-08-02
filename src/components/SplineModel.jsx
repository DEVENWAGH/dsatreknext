'use client';

import Spline from '@splinetool/react-spline';
import { useState, useEffect, useRef } from 'react';

export default function SplineModel() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isLargeScreen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isLargeScreen]);

  return (
    <div ref={containerRef} className="relative h-180 flex-shrink-0">
      {shouldLoad && isLargeScreen && (
        <Spline
          scene="https://prod.spline.design/2gD1BKUgJa9zGb13/scene.splinecode"
          style={{
            width: '100%',
            height: '100%',
            transform: 'scale(1.2) translate(5%, -5%)',
            background: 'transparent',
          }}
        />
      )}
    </div>
  );
}
