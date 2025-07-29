'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import useAlgorithmStore from '@/store/algorithmStore';
import { SmoothScroll } from '@/components/ui/smooth-scroll';

const Sidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'home';
  const currentAlgorithm = searchParams.get('algorithm');

  const {
    algorithmCategories,
    setCurrentAlgorithm,
    setArraySize,
    generateNewArray,
  } = useAlgorithmStore();

  const handleAlgorithmSelect = (category, algorithm) => {
    const categoryPath = category.toLowerCase().replace(/\s+/g, '-');
    const algorithmPath = algorithm.toLowerCase().replace(/\s+/g, '-');
    const urlPath = `/visualizer?category=${categoryPath}&algorithm=${algorithmPath}`;

    setCurrentAlgorithm(algorithm);
    setArraySize(50);
    generateNewArray();
    router.push(urlPath);
  };

  const handleCategorySelect = category => {
    const categoryPath = category.toLowerCase().replace(/\s+/g, '-');
    const urlPath = `/visualizer?category=${categoryPath}`;
    router.push(urlPath);
  };

  const isAlgorithmActive = algorithm => {
    return currentAlgorithm === algorithm.toLowerCase().replace(/\s+/g, '-');
  };

  const isCategoryActive = category => {
    return currentCategory === category.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <aside className="visualizer-sidebar fixed top-0 left-0 w-64 h-screen shadow-lg hidden md:block">
      <SmoothScroll
        className="h-full p-4 pt-28"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#0ea5e9 #1e293b' }}
      >
        {Object.entries(algorithmCategories).map(([category, algorithms]) => (
          <div key={category} className="mb-6">
            <button
              onClick={() => handleCategorySelect(category)}
              className={`w-full text-left mb-2 text-sm font-semibold transition-colors ${
                isCategoryActive(category)
                  ? 'text-brand'
                  : 'text-muted-foreground hover:text-brand'
              }`}
            >
              {category}
            </button>
            <div className="space-y-1">
              {algorithms.map(algorithm => (
                <button
                  key={algorithm}
                  onClick={() => handleAlgorithmSelect(category, algorithm)}
                  className={`group relative w-full text-left px-3 py-2 rounded-lg transition-all overflow-hidden border font-medium focus:outline-none focus:ring-2 focus:ring-ring
                  ${
                    isAlgorithmActive(algorithm)
                      ? 'bg-primary text-primary-foreground border-border shadow-lg'
                      : 'bg-secondary text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{
                      x: '100%',
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <span className="relative z-10">{algorithm}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </SmoothScroll>
    </aside>
  );
};

export default Sidebar;
