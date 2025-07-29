'use client';

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

function ParallaxText({ children, baseVelocity = 100, className, ...props }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], {
    clamp: false,
  });

  const [repetitions, setRepetitions] = useState(3);
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.offsetWidth;
        // Ensure we have enough repetitions for seamless scrolling
        const newRepetitions = Math.max(
          3,
          Math.ceil((containerWidth * 2) / textWidth) + 1
        );
        setRepetitions(newRepetitions);
      }
    };

    // Use setTimeout to ensure elements are rendered
    const timer = setTimeout(calculateRepetitions, 100);

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', calculateRepetitions);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', calculateRepetitions);
      }
    };
  }, [children]);

  const x = useTransform(baseX, v => `${wrap(-100 / repetitions, 0, v)}%`);

  const directionFactor = useRef(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // Smooth velocity changes to avoid jerky motion
    const currentVelocity = velocityFactor.get();
    if (Math.abs(currentVelocity) > 0.1) {
      moveBy += directionFactor.current * moveBy * currentVelocity * 0.5;
    }

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div
      ref={containerRef}
      className={cn('w-full overflow-hidden whitespace-nowrap', className)}
      {...props}
    >
      <motion.div className="inline-flex items-center" style={{ x }}>
        {Array.from({ length: repetitions }).map((_, i) => (
          <div
            key={`item-${i}`}
            ref={i === 0 ? textRef : null}
            className="inline-flex items-center shrink-0"
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function VelocityScroll({
  defaultVelocity = 5,
  numRows = 2,
  children,
  className,
  rowClassName,
  ...props
}) {
  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      {...props}
    >
      {Array.from({ length: numRows }).map((_, i) => (
        <ParallaxText
          key={i}
          baseVelocity={defaultVelocity * (i % 2 === 0 ? -1 : 1)} // Switch directions: first row left, second row right
          className={cn('py-4', rowClassName)}
        >
          {children}
        </ParallaxText>
      ))}
    </div>
  );
}
