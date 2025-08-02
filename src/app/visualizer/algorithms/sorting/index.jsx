const getDelay = speed => {
  // More responsive delay calculation with a better curve
  return Math.floor(1000 - (speed / 100) * 950);
};

const waitForResume = async getIsPlaying => {
  while (!getIsPlaying()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

const animateSwap = async (arr, i, j, setArray, getSpeed) => {
  const delay = getDelay(getSpeed());

  // Perform swap
  [arr[i], arr[j]] = [arr[j], arr[i]];

  // Update array to show new positions
  setArray([...arr]);
  await new Promise(resolve => setTimeout(resolve, delay * 0.5));
};

const shouldSwap = (a, b, isAscending) => {
  return isAscending ? a > b : a < b;
};

const isInOrder = (a, b, isAscending) => {
  return isAscending ? a <= b : a >= b;
};

export const bubbleSort = async (
  array,
  setArray,
  setCurrentIndex,
  setCompareIndex,
  getSpeed,
  getIsPlaying,
  isAscending
) => {
  // Create a fresh copy of the array to avoid reference issues
  const arr = array.map(val =>
    typeof val === 'object' ? val.value || val : val
  );
  const n = arr.length;

  try {
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;

      for (let j = 0; j < n - i - 1; j++) {
        // Check if sorting should continue
        if (!getIsPlaying()) {
          await waitForResume(getIsPlaying);
        }

        // Set comparison indices
        setCurrentIndex(j);
        setCompareIndex(j + 1);

        // Wait for visualization
        await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())));

        // Compare and swap if needed
        if (shouldSwap(arr[j], arr[j + 1], isAscending)) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;

          // Update array immediately after swap
          setArray([...arr]);

          // Brief pause to show the swap
          await new Promise(resolve =>
            setTimeout(resolve, getDelay(getSpeed()) * 0.3)
          );
        }
      }

      // If no swaps occurred, array is sorted
      if (!swapped) break;
    }
  } catch (error) {
    // Handle any errors gracefully
    console.error('Bubble sort error:', error);
  } finally {
    // Always clear indices when done
    setCurrentIndex(-1);
    setCompareIndex(-1);
  }

  return arr;
};

export const insertionSort = async (
  array,
  setArray,
  setCurrentIndex,
  setCompareIndex,
  getSpeed,
  getIsPlaying,
  isAscending
) => {
  const arr = [...array];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying);

    setCurrentIndex(i);
    const key = arr[i];
    let j = i - 1;

    // Highlight the current element to be inserted
    await new Promise(resolve =>
      setTimeout(resolve, getDelay(getSpeed()) * 0.5)
    );

    // Simple insertion sort for better visualization
    while (j >= 0 && shouldSwap(arr[j], key, isAscending)) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);

      setCompareIndex(j);
      await new Promise(resolve =>
        setTimeout(resolve, getDelay(getSpeed()) * 0.5)
      );

      arr[j + 1] = arr[j];
      setArray([...arr]);
      await new Promise(resolve =>
        setTimeout(resolve, getDelay(getSpeed()) * 0.5)
      );

      j--;
    }

    arr[j + 1] = key;
    setArray([...arr]);
    await new Promise(resolve =>
      setTimeout(resolve, getDelay(getSpeed()) * 0.5)
    );
  }

  setCurrentIndex(-1);
  setCompareIndex(-1);
  return arr;
};

export const selectionSort = async (
  array,
  setArray,
  setCurrentIndex,
  setCompareIndex,
  getSpeed,
  getIsPlaying,
  isAscending
) => {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let extremeIdx = i;
    setCurrentIndex(i);

    for (let j = i + 1; j < n; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);

      setCompareIndex(j);
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())));

      // Fix comparison logic for ascending/descending
      if (isAscending ? arr[j] < arr[extremeIdx] : arr[j] > arr[extremeIdx]) {
        extremeIdx = j;
      }
    }

    if (extremeIdx !== i) {
      await animateSwap(arr, i, extremeIdx, setArray, getSpeed);
    }
  }

  setCurrentIndex(-1);
  setCompareIndex(-1);
  return arr;
};

export const quickSort = async (
  array,
  setArray,
  setCurrentIndex,
  setCompareIndex,
  getSpeed,
  getIsPlaying,
  isAscending
) => {
  const arr = [...array];

  // Simplified pivot selection for better visualization
  const partition = async (low, high) => {
    const pivot = arr[high]; // Use the last element as pivot for clarity
    setCurrentIndex(high);
    await new Promise(resolve =>
      setTimeout(resolve, getDelay(getSpeed()) * 0.5)
    );

    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);

      setCompareIndex(j);
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())));

      if (isInOrder(arr[j], pivot, isAscending)) {
        i++;
        if (i !== j) {
          await animateSwap(arr, i, j, setArray, getSpeed);
        }
      }
    }

    await animateSwap(arr, i + 1, high, setArray, getSpeed);
    return i + 1;
  };

  const quickSortHelper = async (low, high) => {
    if (low < high) {
      const pi = await partition(low, high);

      // Visualize partitioning
      setCurrentIndex(-1);
      setCompareIndex(-1);
      await new Promise(resolve =>
        setTimeout(resolve, getDelay(getSpeed()) * 0.3)
      );

      await quickSortHelper(low, pi - 1);
      await quickSortHelper(pi + 1, high);
    }
  };

  await quickSortHelper(0, arr.length - 1);
  setCurrentIndex(-1);
  setCompareIndex(-1);
  return arr;
};

export const getSortingAlgorithm = name => {
  const algorithms = {
    'bubble-sort': bubbleSort,
    'insertion-sort': insertionSort,
    'selection-sort': selectionSort,
    'quick-sort': quickSort,
  };
  return algorithms[name];
};

export default {
  bubbleSort,
  insertionSort,
  selectionSort,
  quickSort,
};
