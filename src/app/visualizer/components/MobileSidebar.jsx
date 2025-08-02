import React from 'react';
import { SmoothScroll } from '@/components/ui/smooth-scroll';
import { motion } from 'motion/react';
import useAlgorithmStore from '@/store/algorithmStore';
import { useRouter } from 'next/navigation';

const MobileSidebar = ({ isOpen, onClose }) => {
  const router = useRouter();
  const {
    algorithmCategories,
    currentAlgorithm,
    setCurrentAlgorithm,
    setArraySize,
    generateNewArray,
  } = useAlgorithmStore();

  const handleAlgorithmSelect = (category, algorithm) => {
    const categoryPath = category.toLowerCase().replace(/\s+/g, '-');
    const algorithmPath = algorithm.toLowerCase().replace(/\s+/g, '-');
    const urlPath = `/visualizer?category=${categoryPath}&algorithm=${algorithmPath}`;
    setCurrentAlgorithm(algorithm);
    setArraySize(50); // Reset array size
    generateNewArray(); // Generate fresh array
    onClose(); // Close sidebar after selection
    router.push(urlPath);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="visualizer-card w-11/12 max-h-[85vh] max-w-md rounded-xl p-5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
          <h3 className="text-xl font-bold text-brand">Algorithm Categories</h3>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <SmoothScroll className="space-y-8 pb-2 overflow-y-auto max-h-[60vh] scroll-smooth scrollbar-thin scrollbar-thumb-sky-500 scrollbar-track-slate-800">
          {Object.entries(algorithmCategories).map(
            ([category, algorithms], categoryIndex) => (
              <motion.div
                key={category}
                className="mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * categoryIndex }}
              >
                <h4 className="text-lg font-bold text-brand mb-2 cursor-default">
                  {category}
                </h4>

                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand rounded-full"></div>

                  <div className="pl-4">
                    {algorithms.map((algorithm, algoIndex) => (
                      <div
                        key={algorithm}
                        onClick={() =>
                          handleAlgorithmSelect(category, algorithm)
                        }
                        className={`cursor-pointer transition-colors py-1.5
                        ${
                          currentAlgorithm === algorithm
                            ? 'font-medium text-brand'
                            : 'text-muted-foreground hover:text-brand'
                        }`}
                      >
                        {algorithm}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          )}
        </SmoothScroll>
      </motion.div>
    </motion.div>
  );
};

export default MobileSidebar;
