/**
 * Integration utilities for smooth scroll system
 */

import { scrollToElement, scrollToSection, scrollToTop } from './scrollUtils';

/**
 * Enhanced navigation handler with smooth scrolling
 */
export const createSmoothNavigation = navigationItems => {
  return navigationItems.map(item => ({
    ...item,
    onClick: async e => {
      e.preventDefault();

      if (item.href?.startsWith('#')) {
        const sectionId = item.href.slice(1);
        await scrollToSection(sectionId);
      } else if (item.scrollTo) {
        await scrollToElement(item.scrollTo);
      }

      // Call original onClick if exists
      if (item.originalOnClick) {
        item.originalOnClick(e);
      }
    },
  }));
};

/**
 * Add smooth scroll behavior to existing links
 */
export const enhanceScrollLinks = () => {
  if (typeof window === 'undefined') return;

  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', async e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      await scrollToSection(targetId);
    });
  });
};

/**
 * Scroll to top button functionality
 */
export const createScrollToTopButton = (threshold = 300) => {
  if (typeof window === 'undefined') return null;

  let isVisible = false;
  let button = null;

  const updateVisibility = () => {
    const shouldShow = window.scrollY > threshold;

    if (shouldShow && !isVisible) {
      isVisible = true;
      if (button) {
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
      }
    } else if (!shouldShow && isVisible) {
      isVisible = false;
      if (button) {
        button.style.opacity = '0';
        button.style.pointerEvents = 'none';
      }
    }
  };

  const handleClick = async () => {
    await scrollToTop({ duration: 1.5 });
  };

  // Create button element
  button = document.createElement('button');
  button.innerHTML = '↑';
  button.className =
    'fixed bottom-6 right-6 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 opacity-0 pointer-events-none';
  button.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  button.addEventListener('click', handleClick);

  // Add hover effects
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
  });

  document.body.appendChild(button);

  // Listen for scroll events
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateVisibility();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('lenisScroll', handleScroll, { passive: true });

  // Initial check
  updateVisibility();

  return {
    destroy: () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('lenisScroll', handleScroll);
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    },
  };
};

/**
 * Auto-generate table of contents with smooth scrolling
 */
export const generateTableOfContents = (
  containerSelector = 'main',
  headingSelector = 'h1, h2, h3'
) => {
  if (typeof window === 'undefined') return [];

  const container = document.querySelector(containerSelector);
  if (!container) return [];

  const headings = container.querySelectorAll(headingSelector);
  const toc = [];

  headings.forEach((heading, index) => {
    // Generate ID if not exists
    if (!heading.id) {
      heading.id = `heading-${index}-${heading.textContent
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')}`;
    }

    toc.push({
      id: heading.id,
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1)),
      element: heading,
      scrollTo: () => scrollToElement(heading.id),
    });
  });

  return toc;
};

/**
 * Intersection Observer for active section tracking
 */
export const createSectionObserver = (sections, callback, options = {}) => {
  if (typeof window === 'undefined') return null;

  const defaultOptions = {
    rootMargin: '-20% 0px -80% 0px',
    threshold: 0,
  };

  const observerOptions = { ...defaultOptions, ...options };
  let activeSection = null;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const newActiveSection = entry.target.id;
        if (newActiveSection !== activeSection) {
          activeSection = newActiveSection;
          callback(activeSection, entry.target);
        }
      }
    });
  }, observerOptions);

  // Observe all sections
  sections.forEach(sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      observer.observe(element);
    }
  });

  return {
    disconnect: () => observer.disconnect(),
    observe: element => observer.observe(element),
    unobserve: element => observer.unobserve(element),
  };
};

/**
 * Smooth scroll integration for React components
 */
export const withSmoothScroll = WrappedComponent => {
  return function SmoothScrollWrapper(props) {
    const enhancedProps = {
      ...props,
      scrollToElement: (elementId, options) =>
        scrollToElement(elementId, options),
      scrollToSection: (sectionId, options) =>
        scrollToSection(sectionId, options),
      scrollToTop: options => scrollToTop(options),
    };

    return <WrappedComponent {...enhancedProps} />;
  };
};

/**
 * Initialize smooth scroll system
 */
export const initSmoothScroll = (options = {}) => {
  if (typeof window === 'undefined') return;

  const {
    enhanceLinks = true,
    addScrollToTop = true,
    scrollToTopThreshold = 300,
    autoTOC = false,
    tocContainer = 'main',
    tocHeadings = 'h1, h2, h3',
  } = options;

  const cleanup = [];

  // Enhance existing links
  if (enhanceLinks) {
    enhanceScrollLinks();
  }

  // Add scroll to top button
  if (addScrollToTop) {
    const scrollToTopButton = createScrollToTopButton(scrollToTopThreshold);
    if (scrollToTopButton) {
      cleanup.push(scrollToTopButton.destroy);
    }
  }

  // Auto-generate TOC
  let toc = [];
  if (autoTOC) {
    toc = generateTableOfContents(tocContainer, tocHeadings);
  }

  return {
    toc,
    cleanup: () => cleanup.forEach(fn => fn()),
  };
};
