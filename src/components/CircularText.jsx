import { useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'motion/react';
import { useTheme } from '@/components/ui/theme-provider';
import PropTypes from 'prop-types';

const getRotationTransition = (duration, from, loop = true) => ({
  from,
  to: from + 360,
  ease: 'linear',
  duration,
  type: 'tween',
  repeat: loop ? Infinity : 0,
});

const getTransition = (duration, from) => ({
  rotate: getRotationTransition(duration, from),
  scale: {
    type: 'spring',
    damping: 20,
    stiffness: 300,
  },
});

const CircularText = ({
  text = 'Code → Learn → Excel → Conquer → ',
  spinDuration = 20,
  onHover = 'speedUp',
  className = '',
}) => {
  const safeText = text || 'Code → Learn → Excel → Conquer → ';
  const letters = Array.from(safeText);
  const controls = useAnimation();
  const rotation = useMotionValue(0);
  const { theme } = useTheme();

  useEffect(() => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  }, [spinDuration, safeText, onHover, controls, rotation]);

  const handleHoverStart = () => {
    const start = rotation.get();
    if (!onHover) return;

    let transitionConfig;
    let scaleVal = 1;

    switch (onHover) {
      case 'slowDown':
        transitionConfig = getTransition(spinDuration * 2, start);
        break;
      case 'speedUp':
        transitionConfig = getTransition(spinDuration / 4, start);
        break;
      case 'pause':
        transitionConfig = {
          rotate: { type: 'spring', damping: 20, stiffness: 300 },
          scale: { type: 'spring', damping: 20, stiffness: 300 },
        };
        break;
      case 'goBonkers':
        transitionConfig = getTransition(spinDuration / 20, start);
        scaleVal = 0.8;
        break;
      default:
        transitionConfig = getTransition(spinDuration, start);
    }

    controls.start({
      rotate: start + 360,
      scale: scaleVal,
      transition: transitionConfig,
    });
  };

  const handleHoverEnd = () => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  };

  return (
    <motion.div
      className={`circular-text ${className}`}
      style={{ rotate: rotation }}
      initial={{ rotate: 0 }}
      animate={controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const factor = Math.PI / letters.length;
        const x = factor * i;
        const y = factor * i;
        const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;

        // Set color: black in dark theme, inherit otherwise
        const color = theme === 'light' ? '#000' : undefined;

        return (
          <span
            key={`${letter}-${i}`}
            style={{ transform, WebkitTransform: transform, color }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
};

CircularText.propTypes = {
  text: PropTypes.string,
  spinDuration: PropTypes.number,
  onHover: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  className: PropTypes.string,
};

export default CircularText;
