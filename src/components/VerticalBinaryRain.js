import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const GOLD = '#FFD700';
const NUM_COLUMNS = 20;
const NUMBERS_PER_COLUMN = 12;

// Create a deterministic pattern for initial server-side rendering
const initialBinaries = Array.from({ length: NUM_COLUMNS }, (_, colIdx) =>
  Array.from({ length: NUMBERS_PER_COLUMN }, (_, numIdx) =>
    // Use a deterministic pattern based on position
    (colIdx + numIdx) % 2 === 0 ? '1' : '0'
  )
);

// Generate random binaries for client-side only
function generateRandomBinaries() {
  return Array.from({ length: NUM_COLUMNS }, () =>
    Array.from({ length: NUMBERS_PER_COLUMN }, () =>
      Math.random() > 0.5 ? '1' : '0'
    )
  );
}

const VerticalBinaryRain = () => {
  // Start with deterministic pattern for SSR
  const [binaries, setBinaries] = useState(initialBinaries);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only run on client-side to avoid hydration mismatch
    const timer = setTimeout(() => setVisible(true), 2000);

    // Update to random binaries only on client-side after initial render
    if (typeof window !== 'undefined') {
      setBinaries(generateRandomBinaries());
    }

    return () => clearTimeout(timer);
  }, []);

  // Only animate drops from top to middle of viewport
  const dropHeight = '100vh';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        top: -100,
        left: 0,
        width: '100%',
        height: dropHeight,
        pointerEvents: 'none',
        zIndex: 40,
        display: 'flex',
      }}
    >
      {Array.from({ length: NUM_COLUMNS }).map((_, colIdx) => {
        const left = `${((colIdx + 1) / (NUM_COLUMNS + 1)) * 100}%`;
        return (
          <div
            key={colIdx}
            style={{
              position: 'absolute',
              left,
              transform: 'translateX(-50%)',
              width: '2vw',
              height: dropHeight,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {Array.from({ length: NUMBERS_PER_COLUMN }).map((_, numIdx) => {
              // Randomize delay and duration for each drop
              const delay = numIdx * 0.2 + Math.random() * 1;
              const duration = 2 + Math.random() * 1.5;
              return (
                <motion.span
                  key={numIdx}
                  initial={{ y: -40, opacity: 1 }}
                  animate={{ y: dropHeight, opacity: 0 }}
                  transition={{
                    duration,
                    delay,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                  }}
                  style={{
                    color: GOLD,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    marginBottom: '0.1rem',
                    textShadow: '0 0 8px #FFD70088',
                    userSelect: 'none',
                  }}
                >
                  {binaries[colIdx][numIdx]}
                </motion.span>
              );
            })}
          </div>
        );
      })}
    </motion.div>
  );
};

export default VerticalBinaryRain;
