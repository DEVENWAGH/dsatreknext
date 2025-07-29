'use client';
import { cn } from '@/lib/utils';
import { motion, useScroll } from 'motion/react';
import React from 'react';

export const ScrollProgress = React.forwardRef(
  ({ className, ...props }, ref) => {
    const { scrollYProgress } = useScroll();

    return (
      <motion.div
        ref={ref}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 h-px origin-left bg-gradient-to-r from-transparent via-[#f5ac01]/30 to-[#f5ac01] dark:from-transparent dark:via-[#f5ac01]/30 dark:to-[#f5ac01]',
          className
        )}
        style={{
          scaleX: scrollYProgress,
        }}
        {...props}
      />
    );
  }
);

ScrollProgress.displayName = 'ScrollProgress';
