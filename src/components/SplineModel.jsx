'use client';

import Spline from '@splinetool/react-spline';
import { useState, useEffect, useRef } from 'react';

export default function SplineModel() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
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
  }, []);

  return (
    <div ref={containerRef} className="relative h-180 flex-shrink-0">
      {shouldLoad && (
        <Spline
          scene="https://prod.spline.design/2gD1BKUgJa9zGb13/scene.splinecode"
          style={{
            width: '100%',
            height: '100%',
            transform: 'scale(1.2) translate(5%, -5%)',
          }}
        />
      )}
    </div>
  );
}
