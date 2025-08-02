import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import { createNoise2D } from 'simplex-noise';

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
  ...props
}) => {
  // Create a ref for noise to maintain the same noise function across renders
  const noiseRef = useRef(null);
  let w, h, nt, i, x, ctx, canvas;
  const canvasRef = useRef(null);

  // Initialize noise function
  useEffect(() => {
    // Create noise function once
    noiseRef.current = createNoise2D();
  }, []);

  const getSpeed = () => {
    switch (speed) {
      case 'slow':
        return 0.001;
      case 'fast':
        return 0.002;
      default:
        return 0.001;
    }
  };

  const init = () => {
    if (!canvasRef.current) return;
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
    nt = 0;

    window.onresize = function () {
      if (!canvas) return;
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };
    render();
  };

  const waveColors = colors ?? [
    '#8c6239',
    '#ffd277',
    '#d4af37',
    '#b45309',
    '#f59e0b',
  ];

  const drawWave = n => {
    if (!noiseRef.current || !ctx) return;

    nt += getSpeed();
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      for (x = 0; x < w; x += 5) {
        // Use 2D noise instead of 3D noise
        const y = noiseRef.current(x / 800, 0.3 * i + nt) * 100;
        ctx.lineTo(x, y + h * 0.5);
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  let animationId = useRef(null);

  const render = () => {
    if (!ctx) return;

    // Get computed background color from CSS variable
    const computedBg = getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim();
    // Handle oklch format by using the computed style from body element
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    ctx.fillStyle = bodyBg || `oklch(${computedBg})` || backgroundFill;
    ctx.globalAlpha = waveOpacity || 0.5;
    ctx.fillRect(0, 0, w, h);
    drawWave(5);
    animationId.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    init();
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    // Support for Safari
    setIsSafari(
      typeof window !== 'undefined' &&
        navigator.userAgent.includes('Safari') &&
        !navigator.userAgent.includes('Chrome')
    );
  }, []);

  return (
    <div
      className={cn(
        'h-screen flex flex-col items-center justify-center',
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn('relative z-10', className)} {...props}>
        {children}
      </div>
    </div>
  );
};
