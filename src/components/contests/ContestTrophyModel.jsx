'use client';

import Spline from '@splinetool/react-spline';
import { useState, useEffect } from 'react';

export default function ContestTrophyModel({ onLoaded }) {
  const [, setIsLoading] = useState(true);
  const [, setError] = useState(false);
  const [spline, setSpline] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Simulate a delay to ensure animation works properly
  useEffect(() => {
    if (spline) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        if (onLoaded) onLoaded();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [spline, onLoaded]);

  const handleLoad = splineApp => {
    setSpline(splineApp);
  };

  return (
    <div className="items-center h-[60vh] justify-center relative w-full overflow-hidden">
      {isLargeScreen && (
        <Spline
          scene="https://prod.spline.design/G7WNStYzf35XzbdX/scene.splinecode"
          onLoad={handleLoad}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          style={{
            width: '100%',
            height: '100%',
            transform: 'scale(1.5) translate(0%, 10%)',
            background: 'transparent',
          }}
        />
      )}
    </div>
  );
}
