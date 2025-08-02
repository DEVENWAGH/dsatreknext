import { useEffect, useRef } from 'react';
import { usePrefetchProblem } from '@/hooks/useProblems';

const isValidUUID = str => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const usePrefetch = (currentProblemId, sortedProblems) => {
  const prefetchProblem = usePrefetchProblem();
  const prefetchedRef = useRef(new Set());

  useEffect(() => {
    if (!currentProblemId || sortedProblems.length === 0) return;

    const currentIndex = sortedProblems.findIndex(
      p => p.id === currentProblemId
    );
    if (currentIndex === -1) return;

    // Prefetch adjacent problems
    const prefetchProblems = [];

    // Previous problem
    if (currentIndex > 0) {
      prefetchProblems.push(sortedProblems[currentIndex - 1]);
    }

    // Next problem
    if (currentIndex < sortedProblems.length - 1) {
      prefetchProblems.push(sortedProblems[currentIndex + 1]);
    }

    // Prefetch with delay to avoid blocking current navigation
    const prefetchTimer = setTimeout(() => {
      prefetchProblems.forEach(problem => {
        // Only prefetch if it's a valid UUID and not already prefetched
        if (isValidUUID(problem.id) && !prefetchedRef.current.has(problem.id)) {
          prefetchedRef.current.add(problem.id);
          prefetchProblem(problem.id);
        }
      });
    }, 500);

    return () => clearTimeout(prefetchTimer);
  }, [currentProblemId, sortedProblems, prefetchProblem]);

  // Clean up prefetch cache when component unmounts
  useEffect(() => {
    const currentRef = prefetchedRef.current;
    return () => {
      currentRef.clear();
    };
  }, []);
};
