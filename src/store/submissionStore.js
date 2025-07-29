import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { submissionAPI } from '@/api/api';

/**
 * Store for tracking problem submission status
 * @typedef {Object} SubmissionState
 * @property {Object} submittedProblems - Record of problem IDs that have been submitted
 * @property {Function} markAsSubmitted - Function to mark a problem as submitted
 * @property {Function} isSubmitted - Function to check if a problem has been submitted
 */

const useSubmissionStore = create(
  persist(
    (set, get) => ({
      submittedProblems: {},
      solvedProblems: {},
      markAsSubmitted: problemId =>
        set(state => ({
          submittedProblems: {
            ...state.submittedProblems,
            [problemId]: true,
          },
        })),
      isSubmitted: problemId => get().submittedProblems[problemId] || false,
      isProblemSolved: problemId => get().solvedProblems[problemId] || false,
      getSolvedProblemById: async (problemId, userId) => {
        try {
          const response = await submissionAPI.getSolvedProblemById(
            problemId,
            userId
          );
          if (response.success && response.data) {
            set(state => ({
              solvedProblems: {
                ...state.solvedProblems,
                [problemId]: true,
              },
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error getting solved problem:', error);
          return false;
        }
      },
      getSolvedProblems: async () => {
        try {
          const response = await submissionAPI.getSolvedProblem();
          if (response.success && response.data) {
            const solvedProblems = {};
            response.data.forEach(problem => {
              solvedProblems[problem.problemId] = true;
            });
            set({ solvedProblems });
          }
        } catch (error) {
          console.error('Error getting solved problems:', error);
        }
      },
      clearSolvedProblems: () =>
        set({ solvedProblems: {}, submittedProblems: {} }),
    }),
    {
      name: 'dsatrek-submissions',
    }
  )
);

export default useSubmissionStore;
