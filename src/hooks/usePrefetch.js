import { useEffect, useRef } from 'react';
import { useProblemStore } from '@/store/problemStore';

const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const usePrefetch = (currentProblemId, sortedProblems) => {
  const { getProblem, getProblemFromCache } = useProblemStore();
  const prefetchedRef = useRef(new Set());

  useEffect(() => {
    if (!currentProblemId || sortedProblems.length === 0) return;

    const currentIndex = sortedProblems.findIndex(p => p.id === currentProblemId);
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
        // Only prefetch if it's a valid UUID and not already cached
        if (isValidUUID(problem.id) && 
            !prefetchedRef.current.has(problem.id) && 
            !getProblemFromCache(problem.id)?.description) {
          prefetchedRef.current.add(problem.id);
          getProblem(problem.id).catch(() => {
            prefetchedRef.current.delete(problem.id);
          });
        }
      });
    }, 500);

    return () => clearTimeout(prefetchTimer);
  }, [currentProblemId, sortedProblems, getProblem, getProblemFromCache]);

  // Clean up prefetch cache when component unmounts
  useEffect(() => {
    return () => {
      prefetchedRef.current.clear();
    };
  }, []);
};

export const usePrefetchProblems = (enabled = true) => {
  const { getAllProblems, problems } = useProblemStore();

  useEffect(() => {
    if (enabled && problems.length === 0) {
      getAllProblems();
    }
  }, [enabled, getAllProblems, problems.length]);
};