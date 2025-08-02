import { create } from 'zustand';
import { getSortingAlgorithm } from '../app/visualizer/algorithms/sorting/index.jsx';
import { getSearchAlgorithm } from '../app/visualizer/algorithms/searching/index.jsx';

// SSR-safe window access
const getScreenWidth = () =>
  typeof window !== 'undefined' ? window.innerWidth : 1024;

const useAlgorithmStore = create((set, get) => ({
  currentAlgorithm: null,
  currentCategory: null,
  searchQuery: '',
  searchResults: [],
  preventArrayGeneration: false,
  algorithmCategories: {
    Sorting: [
      'Bubble Sort',
      'Selection Sort',
      'Insertion Sort',
      'Merge Sort',
      'Quick Sort',
    ],
    Searching: ['Linear Search', 'Binary Search'],
    Graph: [
      'BFS',
      'DFS',
      "Dijkstra's Algorithm",
      "Prim's Algorithm",
      "Kruskal's Algorithm",
    ],
    'Dynamic Programming': ['Fibonacci', 'Knapsack', 'LIS', 'LCS'],
    'Greedy Algorithm': ['Activity Selection', 'Huffman Coding'],
    Backtracking: ['N-Queens', 'Sudoku Solver'],
    'Tree Algorithms': [
      'Tree Traversals',
      'Binary Search Tree',
      'AVL Tree',
      'Red-Black Tree',
    ],
    'Mathematical Algorithms': [
      'GCD (Euclidean)',
      'Sieve of Eratosthenes',
      'Prime Factorization',
    ],
  },

  array: [],
  arraySize: 20,
  defaultArraySize: 20,
  isSorting: false,
  isPlaying: false,
  speed: 50,
  currentSpeed: 50,
  currentIndex: -1,
  compareIndex: -1,
  isSorted: false,
  isPaused: false,
  isAscending: true,

  searchArray: [],
  currentSearchIndex: -1,
  searchTarget: null,
  searchResult: null,
  isSearching: false,
  searchArraySize: 12,
  isSearchPlaying: false,
  isSearchPaused: false,

  setArraySize: size => {
    set({ preventArrayGeneration: true });
    try {
      const { currentAlgorithm } = get();
      const screenWidth = getScreenWidth();
      let maxSize, minSize;

      if (screenWidth < 640) {
        minSize = 5;
        maxSize = 30;
      } else if (screenWidth < 1024) {
        minSize = 8;
        maxSize = 50;
      } else {
        minSize = 10;
        maxSize = 100;
      }

      const adjustedSize = Math.min(Math.max(size, minSize), maxSize);
      const baseHeight = screenWidth < 640 ? 20 : screenWidth < 1024 ? 15 : 10;

      const newArray = Array.from({ length: adjustedSize }, () =>
        Math.floor(Math.random() * (200 - baseHeight) + baseHeight)
      );

      set({
        array: newArray,
        arraySize: adjustedSize,
        currentIndex: -1,
        compareIndex: -1,
        isPlaying: false,
        isSorting: false,
        isSorted: false,
        isPaused: false,
        currentAlgorithm,
      });

      return adjustedSize;
    } finally {
      setTimeout(() => set({ preventArrayGeneration: false }), 200);
    }
  },

  generateNewArray: () => {
    if (get().preventArrayGeneration) return get().arraySize;

    const { arraySize } = get();
    const sizeToUse =
      arraySize ||
      (() => {
        const screenWidth = getScreenWidth();
        return screenWidth < 1024 ? 16 : 36;
      })();

    const screenWidth = getScreenWidth();
    const baseHeight = screenWidth < 640 ? 20 : screenWidth < 1024 ? 15 : 10;

    const newArray = Array.from({ length: sizeToUse }, () =>
      Math.floor(Math.random() * (200 - baseHeight) + baseHeight)
    );

    set(state => ({
      ...state,
      array: newArray,
      arraySize: sizeToUse,
      currentIndex: -1,
      compareIndex: -1,
      isPlaying: false,
      isSorting: false,
      isSorted: false,
      isPaused: false,
    }));

    return sizeToUse;
  },

  generateSearchArray: () => {
    const { searchArraySize, currentAlgorithm } = get();
    const newArray = Array.from(
      { length: searchArraySize },
      () => Math.floor(Math.random() * 999) + 1
    );
    const shouldSort = currentAlgorithm?.toLowerCase().includes('binary');
    if (shouldSort) {
      newArray.sort((a, b) => a - b);
    }

    set({
      searchArray: newArray,
      currentSearchIndex: -1,
      searchResult: null,
      searchTarget: null,
      isSearching: false,
      isSearchPlaying: false,
      isSearchPaused: false,
    });
  },

  setCurrentAlgorithm: algorithm => {
    const screenWidth = getScreenWidth();
    const defaultSize = screenWidth < 640 ? 15 : screenWidth < 1024 ? 20 : 36;

    set(state => ({
      ...state,
      currentAlgorithm: algorithm,
      isSorting: false,
      isPlaying: false,
      isSorted: false,
    }));

    set({ preventArrayGeneration: true });

    try {
      set({ arraySize: defaultSize });
      const baseHeight = screenWidth < 640 ? 20 : screenWidth < 1024 ? 15 : 10;

      const newArray = Array.from({ length: defaultSize }, () =>
        Math.floor(Math.random() * (200 - baseHeight) + baseHeight)
      );

      set({
        array: newArray,
        currentIndex: -1,
        compareIndex: -1,
        isPlaying: false,
        isSorting: false,
        isSorted: false,
        isPaused: false,
      });
    } finally {
      setTimeout(() => set({ preventArrayGeneration: false }), 100);
    }
  },

  searchAlgorithms: query => {
    const { algorithmCategories } = get();
    const results = [];
    Object.entries(algorithmCategories).forEach(([category, algorithms]) => {
      algorithms.forEach(algo => {
        if (algo.toLowerCase().includes(query.toLowerCase())) {
          results.push({ category, name: algo });
        }
      });
    });
    set({ searchResults: results });
  },

  setSearchQuery: query => set({ searchQuery: query }),
  setSpeed: speed => set({ speed, currentSpeed: speed }),
  setIsPlaying: isPlaying => set({ isPlaying }),
  setCurrentIndex: index => set({ currentIndex: index }),
  setCompareIndex: index => set({ compareIndex: index }),

  reset: () => {
    set({
      isPlaying: false,
      isSorting: false,
      isPaused: false,
      isSorted: false,
      currentIndex: -1,
      compareIndex: -1,
    });
  },

  forceReset: () => {
    const { arraySize } = get();
    const screenWidth = getScreenWidth();
    const baseHeight = screenWidth < 640 ? 20 : screenWidth < 1024 ? 15 : 10;

    const newArray = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * (200 - baseHeight) + baseHeight)
    );

    set({
      array: newArray,
      isPlaying: false,
      isSorting: false,
      isPaused: false,
      isSorted: false,
      currentIndex: -1,
      compareIndex: -1,
      currentSortId: null, // Cancel any ongoing sorts
    });
  },

  startSorting: async () => {
    const state = get();
    const { array, currentAlgorithm, isAscending, isSorting } = state;

    // Prevent multiple sorts from running
    if (isSorting || !array.length || !currentAlgorithm) return;

    // Create a unique sort ID to track this sort operation
    const sortId = Date.now();

    set({
      isSorting: true,
      isPlaying: true,
      isPaused: false,
      isSorted: false,
      currentIndex: -1,
      compareIndex: -1,
      currentSortId: sortId,
    });

    try {
      const algorithm = getSortingAlgorithm(
        currentAlgorithm?.toLowerCase().replace(/\s+/g, '-')
      );

      if (algorithm) {
        await algorithm(
          [...array], // Always pass a fresh copy
          newArray => {
            // Only update if this is still the current sort
            if (get().currentSortId === sortId) {
              set({ array: newArray });
            }
          },
          index => {
            if (get().currentSortId === sortId) {
              set({ currentIndex: index });
            }
          },
          index => {
            if (get().currentSortId === sortId) {
              set({ compareIndex: index });
            }
          },
          () => get().speed,
          () => get().isPlaying && get().currentSortId === sortId,
          isAscending
        );

        // Only complete if this is still the current sort
        if (get().currentSortId === sortId) {
          set({
            isSorting: false,
            isPlaying: false,
            currentIndex: -1,
            compareIndex: -1,
            isSorted: true,
          });
        }
      }
    } catch (error) {
      if (get().currentSortId === sortId) {
        set({
          isSorting: false,
          isPlaying: false,
          isPaused: false,
          isSorted: false,
          currentIndex: -1,
          compareIndex: -1,
        });
      }
    }
  },

  startSearch: async target => {
    const { searchArray, currentAlgorithm } = get();
    if (!currentAlgorithm) return;

    const algorithm = getSearchAlgorithm(
      currentAlgorithm.toLowerCase().replace(/\s+/g, '-')
    );

    if (!algorithm) return;

    set({
      isSearching: true,
      isSearchPlaying: true,
      isSearchPaused: false,
      searchTarget: target,
      searchResult: null,
      currentSearchIndex: -1,
    });

    try {
      const result = await algorithm(
        searchArray,
        parseInt(target),
        index => set({ currentSearchIndex: index }),
        () => get().isSearchPlaying,
        () => get().speed
      );

      set({
        searchResult: result !== -1,
        currentSearchIndex: result,
        isSearching: false,
        isSearchPlaying: false,
      });
    } catch (error) {
      console.error('Search error:', error);
      set({
        isSearching: false,
        isSearchPlaying: false,
      });
    }
  },

  pauseSorting: () => set({ isPlaying: false, isPaused: true }),
  resumeSorting: () => {
    const { isSorting } = get();
    if (isSorting) {
      set({ isPlaying: true, isPaused: false });
    }
  },

  setCustomArray: values => {
    try {
      set({ preventArrayGeneration: true });

      const processedValues = values.map(value => {
        let numValue;
        if (typeof value === 'object' && value !== null) {
          numValue = value.value;
        } else if (typeof value === 'string') {
          numValue = parseFloat(value.trim());
        } else {
          numValue = Number(value);
        }

        return isNaN(numValue)
          ? Math.floor(Math.random() * 200 + 20)
          : numValue;
      });

      set({
        array: processedValues,
        arraySize: processedValues.length,
        currentIndex: -1,
        compareIndex: -1,
        isPlaying: false,
        isSorting: false,
        isSorted: false,
        isPaused: false,
      });

      return processedValues.length;
    } finally {
      set({ preventArrayGeneration: false });
    }
  },

  toggleSortOrder: () => set(state => ({ isAscending: !state.isAscending })),
  setSearchArraySize: size => {
    set({ searchArraySize: size });
    get().generateSearchArray();
  },

  pauseSearch: () => set({ isSearchPlaying: false, isSearchPaused: true }),
  resumeSearch: () => set({ isSearchPlaying: true, isSearchPaused: false }),

  setCustomSearchArray: array => {
    const processedArray = array.map(num => Number(num));
    const { currentAlgorithm } = get();
    const shouldSort = currentAlgorithm?.toLowerCase().includes('binary');

    if (shouldSort) {
      processedArray.sort((a, b) => a - b);
    }

    set({
      searchArray: processedArray,
      searchArraySize: processedArray.length,
      currentSearchIndex: -1,
      searchResult: null,
      searchTarget: null,
      isSearching: false,
      isSearchPlaying: false,
      isSearchPaused: false,
    });

    return processedArray.length;
  },

  updateSizeBasedOnScreen: () => {
    const screenWidth = getScreenWidth();
    const defaultSize = screenWidth < 1024 ? 16 : 36;

    set({ defaultArraySize: defaultSize });

    if (!get().isSorting) {
      set({ arraySize: defaultSize });
      get().generateNewArray();
    }
  },

  updateDefaultSizes: () => {
    if (typeof window === 'undefined') return;

    const screenWidth = getScreenWidth();
    const defaultSize = screenWidth < 1024 ? 16 : 36;

    set({ defaultArraySize: defaultSize });
  },

  initializeClientSizing: () => {
    if (typeof window === 'undefined') return;

    const screenWidth = getScreenWidth();
    const defaultSize = screenWidth < 1024 ? 16 : 36;
    const searchSize = screenWidth < 640 ? 10 : 15;

    set({
      arraySize: defaultSize,
      defaultArraySize: defaultSize,
      searchArraySize: searchSize,
    });
  },
}));

export default useAlgorithmStore;
