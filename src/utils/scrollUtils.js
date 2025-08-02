/**
 * Enhanced smooth scrolling utilities with best practices
 */

// Easing functions for smooth animations
const easings = {
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: t =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),
  custom: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
};

/**
 * Get optimal scroll offset based on viewport and element
 */
const getOptimalOffset = element => {
  const vh = window.innerHeight;
  const elementHeight = element.offsetHeight;

  // Dynamic offset based on element size and viewport
  if (elementHeight > vh * 0.8) return -20;
  if (elementHeight > vh * 0.5) return -60;
  return -100;
};

/**
 * Scroll to element with enhanced options
 */
export const scrollToElement = (elementId, options = {}) => {
  if (typeof window === 'undefined') return Promise.resolve();

  const element =
    document.getElementById(elementId) || document.querySelector(elementId);
  if (!element) return Promise.resolve();

  const defaultOptions = {
    offset: getOptimalOffset(element),
    duration: 1.2,
    easing: easings.custom,
    immediate: false,
    lock: true,
    force: true,
  };

  const scrollOptions = { ...defaultOptions, ...options };

  return new Promise(resolve => {
    if (window.lenis) {
      window.lenis.scrollTo(element, {
        ...scrollOptions,
        onComplete: resolve,
      });
    } else {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
      setTimeout(resolve, scrollOptions.duration * 1000);
    }
  });
};

/**
 * Scroll to top with enhanced animation
 */
export const scrollToTop = (options = {}) => {
  if (typeof window === 'undefined') return Promise.resolve();

  const defaultOptions = {
    duration: 1.5,
    easing: easings.easeOutQuart,
    offset: 0,
  };

  const scrollOptions = { ...defaultOptions, ...options };

  return new Promise(resolve => {
    if (window.lenis) {
      window.lenis.scrollTo(0, {
        ...scrollOptions,
        onComplete: resolve,
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(resolve, scrollOptions.duration * 1000);
    }
  });
};

/**
 * Scroll to section with stack alignment
 */
export const scrollToSection = (sectionId, options = {}) => {
  return scrollToElement(`#${sectionId}`, {
    offset: -80,
    duration: 1.4,
    ...options,
  });
};

/**
 * Smooth scroll with progress callback
 */
export const scrollWithProgress = (target, options = {}) => {
  const { onProgress, ...scrollOptions } = options;

  if (typeof window === 'undefined') return Promise.resolve();

  return new Promise(resolve => {
    const startY = window.scrollY;
    const targetY =
      typeof target === 'number'
        ? target
        : document.querySelector(target)?.offsetTop || 0;

    const distance = targetY - startY;
    const duration = scrollOptions.duration || 1200;
    const startTime = performance.now();

    const animate = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = easings.easeOutCubic(progress);
      const currentY = startY + distance * eased;

      window.scrollTo(0, currentY);

      if (onProgress) onProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    if (window.lenis) {
      window.lenis.scrollTo(target, {
        ...scrollOptions,
        onComplete: resolve,
      });
    } else {
      requestAnimationFrame(animate);
    }
  });
};

/**
 * Get scroll progress (0-1)
 */
export const getScrollProgress = () => {
  if (typeof window === 'undefined') return 0;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  return Math.min(scrollTop / docHeight, 1);
};

/**
 * Check if element is in viewport
 */
export const isInViewport = (element, threshold = 0.1) => {
  if (!element || typeof window === 'undefined') return false;

  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  return (
    rect.top < windowHeight * (1 - threshold) &&
    rect.bottom > windowHeight * threshold
  );
};

/**
 * Debounced scroll handler
 */
export const createScrollHandler = (callback, delay = 16) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};
