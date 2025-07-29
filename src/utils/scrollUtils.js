/**
 * Utility functions for smooth scrolling with Lenis
 */

/**
 * Scroll to a specific element with Lenis
 * @param {string} elementId - ID of the element to scroll to
 * @param {Object} options - Scroll options
 */
export const scrollToElement = (elementId, options = {}) => {
  if (typeof window === 'undefined') return;

  const element = document.getElementById(elementId);
  if (!element) return;

  if (window.lenis) {
    window.lenis.scrollTo(element, {
      offset: -100,
      duration: 1.2,
      ...options,
    });
  } else {
    // Fallback to native scrolling if Lenis is not available
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Scroll to top of the page with Lenis
 * @param {Object} options - Scroll options
 */
export const scrollToTop = (options = {}) => {
  if (typeof window === 'undefined') return;

  if (window.lenis) {
    window.lenis.scrollTo(0, {
      duration: 1.2,
      ...options,
    });
  } else {
    // Fallback to native scrolling if Lenis is not available
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
