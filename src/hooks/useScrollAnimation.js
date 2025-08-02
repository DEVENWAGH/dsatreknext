'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Enhanced scroll animation hook with smooth alignment
 */
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
    spring = { stiffness: 100, damping: 30, restDelta: 0.001 },
  } = options;

  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef(null);

  const scrollY = useMotionValue(0);
  const scrollProgress = useMotionValue(0);

  // Smooth spring animations
  const smoothScrollY = useSpring(scrollY, spring);
  const smoothProgress = useSpring(scrollProgress, spring);

  // Transform values for animations
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    smoothProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8]
  );
  const y = useTransform(smoothScrollY, [0, 1], [50, -50]);

  const updateScrollValues = useCallback(() => {
    if (typeof window === 'undefined' || !ref.current) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate scroll progress
    const elementTop = rect.top;
    const elementHeight = rect.height;
    const progress = Math.max(
      0,
      Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight))
    );

    scrollProgress.set(progress);
    scrollY.set(
      window.scrollY / (document.documentElement.scrollHeight - windowHeight)
    );

    // Check if element is in view
    const inView =
      elementTop < windowHeight * (1 - threshold) &&
      rect.bottom > windowHeight * threshold;

    if (inView && (!triggerOnce || !hasTriggered)) {
      setIsInView(true);
      if (triggerOnce) setHasTriggered(true);
    } else if (!triggerOnce) {
      setIsInView(false);
    }
  }, [threshold, triggerOnce, hasTriggered, scrollProgress, scrollY]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial calculation
    updateScrollValues();

    // Optimized scroll listener
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollValues();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Listen to both native scroll and Lenis scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('lenisScroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollValues, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('lenisScroll', handleScroll);
      window.removeEventListener('resize', updateScrollValues);
    };
  }, [updateScrollValues]);

  return {
    ref,
    isInView,
    scrollY: smoothScrollY,
    scrollProgress: smoothProgress,
    opacity,
    scale,
    y,
    progress: smoothProgress,
  };
};

/**
 * Hook for scroll-triggered animations with stagger
 */
export const useStaggeredScrollAnimation = (itemCount, options = {}) => {
  const { staggerDelay = 0.1, threshold = 0.1, triggerOnce = true } = options;

  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);

          // Stagger animation for child elements
          itemRefs.current.forEach((item, index) => {
            if (item) {
              setTimeout(
                () => {
                  item.style.opacity = '1';
                  item.style.transform = 'translateY(0) scale(1)';
                },
                index * staggerDelay * 1000
              );
            }
          });
        }
      },
      { threshold, rootMargin: '0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, staggerDelay]);

  const setItemRef = useCallback(
    index => el => {
      itemRefs.current[index] = el;
    },
    []
  );

  return { ref, isInView, setItemRef };
};

/**
 * Hook for parallax scroll effects
 */
export const useParallaxScroll = (speed = 0.5, options = {}) => {
  const { offset = 0, clamp = true } = options;
  const ref = useRef(null);
  const y = useMotionValue(0);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateParallax = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const rate = scrolled * speed;
      const yPos = clamp
        ? Math.max(-200, Math.min(200, rate + offset))
        : rate + offset;

      y.set(yPos);
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('lenisScroll', handleScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('lenisScroll', handleScroll);
    };
  }, [speed, offset, clamp, y]);

  return { ref, y: smoothY };
};

/**
 * Hook for scroll progress indicator
 */
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const progressValue = useMotionValue(0);
  const smoothProgress = useSpring(progressValue, {
    stiffness: 100,
    damping: 30,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      const clampedProgress = Math.max(0, Math.min(1, scrollPercent));

      setProgress(clampedProgress);
      progressValue.set(clampedProgress);
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('lenisScroll', handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('lenisScroll', handleScroll);
    };
  }, [progressValue]);

  return { progress, smoothProgress };
};
