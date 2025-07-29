import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { problemAPI } from '@/api/api';
import { toast } from 'sonner';

export const useProblemStore = create(
  persist(
    (set, get) => ({
      // State
      problems: [],
      problemMap: {},
      currentProblem: null,
      filteredProblems: [],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isLoading: false,

      error: null,
      lastFetched: null,

      // Cache duration (10 minutes for better performance)
      CACHE_DURATION: 10 * 60 * 1000,

      // Create problem
      createProblem: async problemData => {
        set({ isCreating: true, error: null });
        try {
          const response = await problemAPI.create(problemData);
          const newProblem = response.data.data;

          set(state => ({
            problems: [...state.problems, newProblem],
            problemMap: {
              ...state.problemMap,
              [newProblem.id]: newProblem,
            },
            isCreating: false,
          }));

          toast.success('Problem created successfully');
          return response.data;
        } catch (error) {
          set({ error: error.message, isCreating: false });
          toast.error(
            error.response?.data?.message || 'Error creating problem'
          );
          throw error;
        }
      },

      // Update problem
      updateProblem: async (id, problemData) => {
        set({ isUpdating: true, error: null });
        try {
          const response = await problemAPI.update(id, problemData);
          const updatedProblem = response.data.data;

          set(state => ({
            problems: state.problems.map(problem =>
              problem.id === id ? updatedProblem : problem
            ),
            problemMap: {
              ...state.problemMap,
              [id]: updatedProblem,
            },
            currentProblem:
              state.currentProblem?.id === id
                ? updatedProblem
                : state.currentProblem,
            isUpdating: false,
          }));

          toast.success('Problem updated successfully');
          return response.data;
        } catch (error) {
          set({ error: error.message, isUpdating: false });
          toast.error(
            error.response?.data?.message || 'Error updating problem'
          );
          throw error;
        }
      },

      // Delete problem
      deleteProblem: async id => {
        set({ isDeleting: true, error: null });
        try {
          const response = await problemAPI.delete(id);

          set(state => {
            const newProblemMap = { ...state.problemMap };
            delete newProblemMap[id];

            return {
              problems: state.problems.filter(problem => problem.id !== id),
              problemMap: newProblemMap,
              currentProblem:
                state.currentProblem?.id === id ? null : state.currentProblem,
              isDeleting: false,
            };
          });

          toast.success('Problem deleted successfully');
          return response.data;
        } catch (error) {
          set({ error: error.message, isDeleting: false });
          toast.error(
            error.response?.data?.message || 'Error deleting problem'
          );
          throw error;
        }
      },

      // Get problem by ID with optimized caching
      getProblem: async id => {
        const state = get();
        const cachedProblem = state.problemMap[id];
        
        // Return cached problem immediately if it has full details
        if (cachedProblem?.description) {
          set({ currentProblem: cachedProblem });
          return { data: { data: [cachedProblem] } };
        }

        // Don't set loading if we have basic problem data
        if (!cachedProblem) {
          set({ isLoading: true, error: null });
        }
        
        try {
          const response = await problemAPI.getById(id);
          const problem = response.success
            ? response.problem
            : response.data?.problem || response.problem;

          if (!problem) {
            throw new Error('Problem not found in response');
          }

          set(state => ({
            currentProblem: problem,
            problemMap: {
              ...state.problemMap,
              [id]: { ...state.problemMap[id], ...problem },
            },
            isLoading: false,
          }));

          return { data: { data: [problem] } };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          if (!cachedProblem) {
            toast.error(
              error.response?.data?.message || 'Error fetching problem'
            );
          }
          throw error;
        }
      },

      // Get all problems (minimal fields only)
      getAllProblems: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        // Use cached data if available and fresh
        if (!forceRefresh && state.problems.length > 0 && state.lastFetched && now - state.lastFetched < state.CACHE_DURATION) {
          return { data: { data: state.problems } };
        }

        set({ isLoading: true, error: null });
        try {
          // Fetch all problems without pagination
          const response = await problemAPI.getAll({
            fields: 'id,title,difficulty,tags,companies,is_premium'
          });
          let problems = [];

          // Handle different response structures
          if (response.success && response.data?.problems) {
            problems = response.data.problems;
          } else if (response.data?.data?.problems) {
            problems = response.data.data.problems;
          } else if (response.data?.problems) {
            problems = response.data.problems;
          } else if (Array.isArray(response.data?.data)) {
            problems = response.data.data;
          } else if (Array.isArray(response.data)) {
            problems = response.data;
          } else if (Array.isArray(response)) {
            problems = response;
          }

          // Ensure problems is an array
          if (!Array.isArray(problems)) {
            problems = [];
          }

          // Create problem map for quick lookups
          const problemMap = problems.reduce((acc, problem) => {
            acc[problem.id] = problem;
            return acc;
          }, {});

          // Debug: Log first few problems to check is_premium field
          console.log('First 3 problems from API:', problems.slice(0, 3));
          
          set({
            problems: problems,
            problemMap: problemMap,
            lastFetched: now,
            isLoading: false
          });

          return { data: { data: problems } };
        } catch (error) {
          console.error('Error fetching problems:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Filter problems
      filterProblems: filters => {
        const { searchQuery, difficulty, tags, companies } = filters;
        const problems = get().problems;

        let filtered = problems;

        // Search filter
        if (searchQuery) {
          filtered = filtered.filter(
            problem =>
              problem.title
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              problem.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              problem.tags?.some(tag =>
                tag.toLowerCase().includes(searchQuery.toLowerCase())
              )
          );
        }

        // Difficulty filter
        if (difficulty && difficulty !== 'all') {
          filtered = filtered.filter(
            problem =>
              problem.difficulty?.toLowerCase() === difficulty.toLowerCase()
          );
        }

        // Tags filter
        if (tags && tags.length > 0) {
          filtered = filtered.filter(problem =>
            tags.every(tag => problem.tags?.includes(tag))
          );
        }

        // Companies filter
        if (companies && companies.length > 0) {
          filtered = filtered.filter(problem =>
            companies.some(company => problem.companies?.includes(company))
          );
        }

        set({ filteredProblems: filtered });
        return filtered;
      },



      getProblemFromCache: id => {
        return get().problemMap[id] || null;
      },

      // Get problems by difficulty
      getProblemsByDifficulty: difficulty => {
        return get().problems.filter(
          problem =>
            problem.difficulty?.toLowerCase() === difficulty.toLowerCase()
        );
      },

      // Get problems by company
      getProblemsByCompany: companyId => {
        return get().problems.filter(problem =>
          problem.companies?.includes(companyId)
        );
      },

      // Clear problem data
      clearProblemData: () => {
        set({
          problems: [],
          problemMap: {},
          currentProblem: null,
          filteredProblems: [],
          lastFetched: null,
        });
      },

      // Set loading state
      setIsLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Set current problem
      setCurrentProblem: problem => {
        set({ currentProblem: problem });
      },
    }),
    {
      name: 'problem-storage',
      partialize: state => ({
        problems: state.problems,
        problemMap: state.problemMap,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
