'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ContestTrophyModel from '@/components/contests/ContestTrophyModel';
import ContestCard from '@/components/contests/ContestCard';

export default function ContestsPage() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [, setIsMounted] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mock data for contests
  const contests = [
    {
      id: 1,
      title: 'Weekly Contest 460',
      startDate: new Date(
        Date.now() + 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000
      ),
      day: 'Sunday',
      time: '8:00 AM',
      timezone: 'GMT+5:30',
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Biweekly Contest 162',
      startDate: new Date(
        Date.now() + 11 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
      ),
      day: 'Saturday',
      time: '8:00 PM',
      timezone: 'GMT+5:30',
      status: 'upcoming',
    },
  ];

  const handleModelLoaded = () => {
    setModelLoaded(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 overflow-hidden">
      {/* Contest Info */}
      <motion.div
        className="w-full text-center mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
          DSATrek Contest
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
          Contest every week. Compete and see your ranking!
        </p>
      </motion.div>

      {/* Desktop layout (lg and above) */}
      <div className="hidden lg:flex lg:flex-row items-center justify-center relative">
        {/* Left Card */}
        <motion.div
          className="w-1/3 z-10"
          initial={{ x: '50%', opacity: 1 }}
          animate={{
            x: modelLoaded ? '-10%' : '50%',
            opacity: 1,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <ContestCard contest={contests[0]} />
        </motion.div>

        {/* Trophy Model - Center */}
        <motion.div
          className="w-1/3 mb-0 relative"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: modelLoaded ? 1 : 0,
            scale: modelLoaded ? 1 : 0.7,
          }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        >
          <ContestTrophyModel onLoaded={handleModelLoaded} />
        </motion.div>

        {/* Right Card */}
        <motion.div
          className="w-1/3 z-10"
          initial={{ x: '-50%', opacity: 1 }}
          animate={{
            x: modelLoaded ? '10%' : '-50%',
            opacity: 1,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <ContestCard contest={contests[1]} isReversed={true} />
        </motion.div>
      </div>

      {/* Mobile/Tablet layout (sm and md) */}
      <div className="lg:hidden relative">
        {/* Trophy Model at top */}
        <motion.div
          className="w-full mb-6"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: modelLoaded ? 1 : 0,
            scale: modelLoaded ? 1 : 0.7,
          }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        >
          <ContestTrophyModel onLoaded={handleModelLoaded} />
        </motion.div>

        {/* Cards stacked below - initially at top, then slide down */}
        <motion.div
          className="space-y-4"
          initial={{ y: -200, opacity: 0 }}
          animate={{
            y: modelLoaded ? 0 : -200,
            opacity: modelLoaded ? 1 : 0,
          }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div>
            <ContestCard contest={contests[0]} />
          </div>

          <div>
            <ContestCard contest={contests[1]} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
