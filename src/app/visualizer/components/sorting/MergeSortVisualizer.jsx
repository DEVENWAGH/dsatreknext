'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MergeSortVisualizer = () => {
  const [elements, setElements] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentStep, setCurrentStep] = useState('Click Start to begin');
  const [comparisons, setComparisons] = useState(0);
  const [merges, setMerges] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    generateArray();
  }, []);

  const generateArray = () => {
    const newArray = Array.from({ length: 8 }, (_, i) => ({
      value: Math.floor(Math.random() * 90) + 10,
      id: `item-${i}`,
      x: i * 80 + 120,
      y: 80,
      originalIndex: i,
      isActive: false,
      isSorted: false,
      isComparing: false,
      isMerging: false,
    }));
    setElements(newArray);
    setCurrentStep('Ready to sort! Click Start to see merge sort in action');
    setComparisons(0);
    setMerges(0);
    setCurrentLevel(0);
  };

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const updateElements = (newElements, customDelay = speed) => {
    return new Promise(resolve => {
      setElements([...newElements]);
      setTimeout(resolve, customDelay);
    });
  };

  const highlightComparison = async (arr, leftIdx, rightIdx) => {
    const highlighted = [...arr];
    if (leftIdx >= 0 && leftIdx < arr.length)
      highlighted[leftIdx].isComparing = true;
    if (rightIdx >= 0 && rightIdx < arr.length)
      highlighted[rightIdx].isComparing = true;

    setComparisons(prev => prev + 1);
    await updateElements(highlighted, speed / 2);

    // Clear comparison highlighting
    highlighted.forEach(el => (el.isComparing = false));
    await updateElements(highlighted, speed / 4);
  };

  const startSort = async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    const arr = [...elements];

    // Initial highlight of entire array
    const initialElements = arr.map(el => ({ ...el, isActive: true }));
    setCurrentStep(
      '🚀 Starting Merge Sort - Analyzing the complete unsorted array'
    );
    await updateElements(initialElements);
    await sleep(speed);

    // Clear initial highlighting
    const clearedElements = arr.map(el => ({ ...el, isActive: false }));
    await updateElements(clearedElements, speed / 2);

    await mergeSortRecursive(arr, 0, arr.length - 1, 1);

    // Final celebration animation
    const sortedElements = arr.map((el, i) => ({
      ...el,
      x: i * 80 + 120,
      y: 80,
      isSorted: true,
      isActive: false,
    }));

    setCurrentStep('🎉 Merge Sort Complete! Array is perfectly sorted!');
    await updateElements(sortedElements);

    // Victory animation
    for (let i = 0; i < sortedElements.length; i++) {
      sortedElements[i].isActive = true;
      await updateElements([...sortedElements], 100);
      sortedElements[i].isActive = false;
    }

    setIsPlaying(false);
  };

  const mergeSortRecursive = async (arr, start, end, level) => {
    if (start >= end) return;

    setCurrentLevel(level);
    const mid = Math.floor((start + end) / 2);
    const subArray = arr.slice(start, end + 1);

    // Highlight the section being divided
    const highlightElements = [...arr];
    for (let i = start; i <= end; i++) {
      highlightElements[i].isActive = true;
    }

    setCurrentStep(
      `📊 Level ${level}: Dividing [${subArray.map(x => x.value).join(',')}] into two parts`
    );
    await updateElements(highlightElements, speed / 2);

    // Show division - move elements down and separate with smooth animation
    const dividedElements = [...arr];
    const leftElements = [];
    const rightElements = [];

    // First, collect the values for display
    for (let i = start; i <= end; i++) {
      if (i <= mid) {
        leftElements.push(arr[i].value);
      } else {
        rightElements.push(arr[i].value);
      }
    }

    setCurrentStep(
      `🔄 Split into: [${leftElements.join(',')}] and [${rightElements.join(',')}]`
    );

    // Then animate the visual separation with proper spacing
    for (let i = start; i <= end; i++) {
      const baseY = 80 + level * 100;
      const element = {
        ...dividedElements[i],
        y: baseY,
        isActive: true,
      };

      if (i <= mid) {
        // Left part - position from left
        element.x = (i - start) * 80 + 100;
      } else {
        // Right part - position with gap to avoid overlap
        element.x = (i - mid - 1) * 80 + 500;
      }

      dividedElements[i] = element;
    }

    await updateElements(dividedElements);

    // Clear active state before recursion
    for (let i = start; i <= end; i++) {
      dividedElements[i].isActive = false;
    }
    await updateElements(dividedElements, speed / 3);

    // Recursively sort left and right halves
    await mergeSortRecursive(arr, start, mid, level + 1);
    await mergeSortRecursive(arr, mid + 1, end, level + 1);

    // Merge the sorted halves
    await merge(arr, start, mid, end, level);
  };

  const merge = async (arr, start, mid, end, level) => {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);

    setMerges(prev => prev + 1);

    // Highlight elements being merged
    const mergingElements = [...arr];
    for (let i = start; i <= end; i++) {
      mergingElements[i].isMerging = true;
    }

    setCurrentStep(
      `🔀 Level ${level}: Merging [${left.map(x => x.value).join(',')}] and [${right.map(x => x.value).join(',')}]`
    );
    await updateElements(mergingElements, speed / 2);

    // Sort left and right arrays first
    left.sort((a, b) => a.value - b.value);
    right.sort((a, b) => a.value - b.value);

    // Merge logic with visual comparisons
    let i = 0,
      j = 0,
      k = start;
    const temp = [];

    while (i < left.length && j < right.length) {
      // Show comparison
      const leftIdx = arr.findIndex(el => el.id === left[i].id);
      const rightIdx = arr.findIndex(el => el.id === right[j].id);

      await highlightComparison(mergingElements, leftIdx, rightIdx);

      if (left[i].value <= right[j].value) {
        temp.push(left[i]);
        i++;
      } else {
        temp.push(right[j]);
        j++;
      }
    }

    while (i < left.length) {
      temp.push(left[i]);
      i++;
    }

    while (j < right.length) {
      temp.push(right[j]);
      j++;
    }

    // Update array with merged elements in correct order and update indices
    for (let i = 0; i < temp.length; i++) {
      arr[start + i] = {
        ...temp[i],
        x: (start + i) * 80 + 120,
        y: 80 + (level - 1) * 100,
        originalIndex: start + i, // Update the index to new sorted position
        isActive: false,
        isMerging: false,
        isSorted: level === 1,
      };
    }

    // Animate merged elements moving back together
    const mergedElements = [...arr];

    setCurrentStep(
      `✅ Merged: [${temp.map(x => x.value).join(',')}] - Now sorted!`
    );
    await updateElements(mergedElements);

    // Brief celebration for this merge
    if (level === 1) {
      for (let i = start; i <= end; i++) {
        mergedElements[i].isActive = true;
      }
      await updateElements(mergedElements, speed / 3);
      for (let i = start; i <= end; i++) {
        mergedElements[i].isActive = false;
      }
      await updateElements(mergedElements, speed / 4);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-slate-800 p-2 overflow-hidden">
      {/* Compact Controls */}
      <div className="mb-2 bg-gradient-to-r from-slate-800 to-slate-700 p-3 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-400">
            Merge Sort Visualizer
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Speed:</label>
              <input
                type="range"
                min="300"
                max="2000"
                step="100"
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-24 accent-blue-500"
                disabled={isPlaying}
              />
              <span className="text-blue-300 text-xs font-mono">{speed}ms</span>
            </div>
            <button
              onClick={generateArray}
              disabled={isPlaying}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-sm font-medium"
            >
              🎲 New Array
            </button>
            <button
              onClick={startSort}
              disabled={isPlaying}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-sm font-medium"
            >
              {isPlaying ? '⏳ Sorting...' : '🚀 Start Sort'}
            </button>
            <div className="flex items-center gap-4 text-xs ml-4">
              <span className="text-gray-400">
                Level:{' '}
                <span className="text-blue-400 font-mono font-bold">
                  {currentLevel}
                </span>
              </span>
              <span className="text-gray-400">
                Comparisons:{' '}
                <span className="text-yellow-400 font-mono font-bold">
                  {comparisons}
                </span>
              </span>
              <span className="text-gray-400">
                Merges:{' '}
                <span className="text-green-400 font-mono font-bold">
                  {merges}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Animation Canvas */}
      <div
        className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-700"
        style={{ height: 'calc(92vh - 100px)', overflow: 'hidden' }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox="0 0 900 600"
          className="w-full h-full relative z-10"
        >
          {/* Current Step Text in Canvas */}
          <text
            x="450"
            y="30"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="16"
            fontWeight="500"
            className="select-none"
          >
            {currentStep}
          </text>
          <AnimatePresence>
            {elements.map(element => {
              const fillColor = element.isSorted
                ? '#10b981'
                : element.isComparing
                  ? '#ef4444'
                  : element.isMerging
                    ? '#f59e0b'
                    : element.isActive
                      ? '#8b5cf6'
                      : '#3b82f6';

              return (
                <motion.g key={element.id}>
                  {/* Glow effect */}
                  <motion.rect
                    width={70}
                    height={50}
                    rx={12}
                    fill={fillColor}
                    opacity={0.3}
                    blur={4}
                    animate={{
                      x: element.x - 35,
                      y: element.y - 25,
                      scale: element.isComparing
                        ? 1.3
                        : element.isActive
                          ? 1.1
                          : 1,
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  />

                  {/* Main element */}
                  <motion.rect
                    width={70}
                    height={50}
                    rx={12}
                    fill={fillColor}
                    stroke={element.isComparing ? '#fbbf24' : '#1e293b'}
                    strokeWidth={element.isComparing ? '3' : '2'}
                    animate={{
                      x: element.x - 35,
                      y: element.y - 25,
                      scale: element.isComparing
                        ? 1.1
                        : element.isActive
                          ? 1.05
                          : 1,
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    style={{
                      filter: element.isComparing
                        ? 'drop-shadow(0 0 10px #fbbf24)'
                        : element.isSorted
                          ? 'drop-shadow(0 0 8px #10b981)'
                          : 'none',
                    }}
                  />

                  {/* Value text */}
                  <motion.text
                    textAnchor="middle"
                    fill="white"
                    fontSize="18"
                    fontWeight="bold"
                    fontFamily="monospace"
                    animate={{
                      x: element.x,
                      y: element.y + 6,
                      scale: element.isComparing ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  >
                    {element.value}
                  </motion.text>

                  {/* Index label */}
                  <motion.text
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="12"
                    fontWeight="500"
                    animate={{
                      x: element.x,
                      y: element.y + 35,
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  >
                    {element.originalIndex}
                  </motion.text>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Minimal Legend */}
      <div className="mt-1 flex justify-center gap-3 text-xs p-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded"></div>
          <span className="text-gray-300">Unsorted</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded"></div>
          <span className="text-gray-300">Active</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded"></div>
          <span className="text-gray-300">Comparing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded"></div>
          <span className="text-gray-300">Merging</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded"></div>
          <span className="text-gray-300">Sorted</span>
        </div>
      </div>
    </div>
  );
};

export default MergeSortVisualizer;
