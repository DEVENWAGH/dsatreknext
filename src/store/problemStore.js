/**
 * @deprecated This store has been replaced by TanStack Query hooks
 * Use the following hooks instead:
 * - useProblems() for fetching problems list
 * - useProblem(id) for individual problem data
 * - useSubmitSolution() for problem submissions
 * - useTestSolution() for running test cases
 *
 * This file is kept for backward compatibility only
 */

import { create } from 'zustand';

// Legacy store - use TanStack Query hooks instead
export const useProblemStore = create(() => ({
  // Deprecated - use TanStack Query hooks
  problems: [],
  isLoading: false,
  error: null,

  // Migration notice
  _migrationNotice:
    'This store is deprecated. Use TanStack Query hooks instead.',

  // Stub methods for backward compatibility
  getAllProblems: () => {
    console.warn(
      'useProblemStore.getAllProblems is deprecated. Use useProblems() hook instead.'
    );
    return Promise.resolve({ data: { data: [] } });
  },

  getProblem: () => {
    console.warn(
      'useProblemStore.getProblem is deprecated. Use useProblem(id) hook instead.'
    );
    return Promise.resolve({ data: { data: null } });
  },

  getProblemFromCache: () => {
    console.warn(
      'useProblemStore.getProblemFromCache is deprecated. Use useProblem(id) hook instead.'
    );
    return null;
  },
}));
