'use client';

import Spline from '@splinetool/react-spline';
import { useState, useEffect, useRef } from 'react';

export default function SplineModel() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
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
      {!shouldLoad && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-gray-500 text-sm">3D Model will load when visible</div>
        </div>
      )}
      {shouldLoad && (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 text-sm">Failed to load model</p>
            </div>
          )}
          <Spline
            scene="https://prod.spline.design/2gD1BKUgJa9zGb13/scene.splinecode"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError(true);
              setIsLoading(false);
            }}
            style={{
              width: '100%',
              height: '100%',
              transform: 'scale(1.2) translate(5%, -5%)',
            }}
          />
        </>
      )}
    </div>
  );
}
