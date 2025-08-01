'use client';

import { motion } from 'motion/react';
import { useScrollAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation';
import { scrollToSection } from '@/utils/scrollUtils';

/**
 * Enhanced ScrollStack component with smooth alignment and animations
 */
export const ScrollStack = ({ 
  children, 
  className = '', 
  stagger = false,
  parallax = false,
  threshold = 0.1,
  ...props 
}) => {
  const { ref, isInView, opacity, scale, y } = useScrollAnimation({
    threshold,
    triggerOnce: true,
    spring: { stiffness: 120, damping: 25, restDelta: 0.001 }
  });

  const animationVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: stagger ? 0.1 : 0
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`scroll-stack ${className}`}
      variants={animationVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{
        opacity: parallax ? opacity : undefined,
        scale: parallax ? scale : undefined,
        y: parallax ? y : undefined
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScrollSection component for section-based navigation
 */
export const ScrollSection = ({ 
  id, 
  children, 
  className = '',
  navTitle,
  fullHeight = false,
  ...props 
}) => {
  const { ref, isInView, scrollProgress } = useScrollAnimation({
    threshold: 0.2,
    triggerOnce: false
  });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`scroll-section ${fullHeight ? 'min-h-screen' : ''} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-nav-title={navTitle}
      {...props}
    >
      {children}
    </motion.section>
  );
};

/**
 * ScrollNavigation component for smooth section navigation
 */
export const ScrollNavigation = ({ sections = [], className = '' }) => {
  const handleNavClick = async (sectionId) => {
    await scrollToSection(sectionId, {
      duration: 1.4,
      offset: -80
    });
  };

  return (
    <nav className={`scroll-navigation ${className}`}>
      <ul className="flex flex-col space-y-2">
        {sections.map((section, index) => (
          <motion.li
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <button
              onClick={() => handleNavClick(section.id)}
              className="text-left hover:text-primary transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-accent/50"
            >
              {section.title}
            </button>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
};

/**
 * ScrollIndicator component for visual scroll progress
 */
export const ScrollIndicator = ({ className = '' }) => {
  const { smoothProgress } = useScrollAnimation();

  return (
    <motion.div
      className={`scroll-indicator fixed top-0 left-0 h-1 bg-primary z-50 ${className}`}
      style={{
        scaleX: smoothProgress,
        transformOrigin: '0%'
      }}
    />
  );
};

/**
 * ScrollTrigger component for triggering animations on scroll
 */
export const ScrollTrigger = ({ 
  children, 
  animation = 'fadeInUp',
  threshold = 0.1,
  triggerOnce = true,
  delay = 0,
  className = ''
}) => {
  const { ref, isInView } = useScrollAnimation({
    threshold,
    triggerOnce
  });

  const animations = {
    fadeInUp: {
      hidden: { opacity: 0, y: 40 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -40 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 40 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={animations[animation]}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggeredList component for staggered animations
 */
export const StaggeredList = ({ 
  items = [], 
  renderItem,
  className = '',
  staggerDelay = 0.1,
  threshold = 0.1
}) => {
  const { ref, isInView, setItemRef } = useStaggeredScrollAnimation(
    items.length, 
    { staggerDelay, threshold }
  );

  return (
    <div ref={ref} className={className}>
      {items.map((item, index) => (
        <motion.div
          key={item.id || index}
          ref={setItemRef(index)}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={isInView ? { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
              delay: index * staggerDelay,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94]
            }
          } : {}}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </div>
  );
};