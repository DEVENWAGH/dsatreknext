import { useRef, useCallback, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Noise component for the glitter effect
const Noise = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay"
    viewBox="0 0 200 200"
  >
    <filter id="noise">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.65"
        numOctaves="3"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const ScrollStackItem = ({ children, itemClassName = '' }) => {
  // Check if this is a header card (no styling) based on className
  const isHeaderCard = itemClassName.includes('bg-transparent');

  return (
    <div
      className={`scroll-stack-card relative w-full h-80 my-8 ${!isHeaderCard ? 'rounded-[40px] overflow-hidden lg:overflow-visible' : ''} box-border origin-top will-change-transform ${itemClassName}`.trim()}
      style={{
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
      }}
    >
      {!isHeaderCard ? (
        <div
          className="relative h-full [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] sm:mx-0 sm:rounded-[40px]"
          style={{
            boxShadow:
              '0 10px 32px rgba(34, 42, 53, 0.12), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 4px 6px rgba(34, 42, 53, 0.08), 0 24px 108px rgba(47, 48, 55, 0.10)',
          }}
        >
          <div className="h-full px-4 py-8 sm:px-10">{children}</div>
        </div>
      ) : (
        <div className="h-full">{children}</div>
      )}
    </div>
  );
};

const ScrollStack = ({ children, className = '', itemDistance = 1000 }) => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const lenisRef = useRef(null);
  const animationFrameRef = useRef(null);
  const scrollTriggersRef = useRef([]);

  // Setup GSAP ScrollTrigger for card stacking
  const setupScrollTriggers = useCallback(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const container = containerRef.current;
    const cards = Array.from(container.querySelectorAll('.scroll-stack-card'));
    cardsRef.current = cards;

    // Clear any existing scroll triggers
    scrollTriggersRef.current.forEach(trigger => trigger.kill());
    scrollTriggersRef.current = [];

    // Create a timeline for stacking cards
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'center center',
        end: `+=${cards.length * itemDistance + 1000}`,
        pin: true,
        scrub: 0.5,
        anticipatePin: 1, // Smoother pinning
      },
    });

    scrollTriggersRef.current.push(timeline.scrollTrigger);

    // Set initial state for all cards
    cards.forEach((card, i) => {
      gsap.set(card, {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        y: i === 0 ? '-50%' : '100%',
        zIndex: i + 1,
        opacity: i === 0 ? 1 : 0,
      });

      // Find 3D model in card and increase its z-index
      const model = card.querySelector('.w-32.h-32');
      if (model) {
        model.style.zIndex = 100;
      }
    });

    // First card is already visible in the middle

    // Make first card more visible with responsive positioning
    timeline.to(
      cards[0],
      {
        y: () => {
          // Set different y values based on screen width
          if (window.innerWidth < 340) return '-60%'; // mobile
          if (window.innerWidth < 440) return '-60%';
          if (window.innerWidth < 650) return '-70%'; // mobile
          if (window.innerWidth < 770) return '-90%'; // tablet/medium
          return '-95%'; // desktop
        },
        ease: 'power2.inOut',
      },
      0
    );

    // Sequential stacking - each card waits for previous to finish
    for (let i = 1; i < cards.length; i++) {
      const yPosition = -40 + i * 10;

      timeline.to(
        cards[i],
        {
          y: `${yPosition}%`,
          opacity: 1,
          ease: 'power2.inOut',
          duration: 1,
        },
        i * 1
      );
    }

    return () => {
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
      scrollTriggersRef.current = [];
    };
  }, [itemDistance]);

  // Setup Lenis smooth scrolling
  const setupLenis = useCallback(() => {
    if (typeof window === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
      lerp: 0.1,
    });

    const raf = time => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };

    animationFrameRef.current = requestAnimationFrame(raf);
    lenisRef.current = lenis;

    return lenis;
  }, []);

  // Initialize everything
  useEffect(() => {
    setupLenis();
    setupScrollTriggers();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
    };
  }, [setupLenis, setupScrollTriggers]);

  return (
    <div className={`relative w-full ${className}`.trim()} ref={containerRef}>
      <div className="px-4 md:px-20">{children}</div>
    </div>
  );
};

export default ScrollStack;
