import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, userAPI } from '@/api/api';

export const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      userDetails: {},
      userStats: {},
      solvedProblems: [],
      isLoading: false,
      isLoadingStats: false,
      error: null,

      // Get user details by ID
      getUserDetails: async userId => {
        // Check cache first
        if (get().userDetails[userId]) {
          return get().userDetails[userId];
        }

        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.getUserDetails(userId);
          const userDetails = response.data.data;

          set(state => ({
            userDetails: {
              ...state.userDetails,
              [userId]: userDetails,
            },
            isLoading: false,
          }));

          return userDetails;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          console.error('Error fetching user details:', error);
          return null;
        }
      },

      // Get user statistics
      getUserStats: async userId => {
        // Check cache first
        if (get().userStats[userId]) {
          return get().userStats[userId];
        }

        set({ isLoadingStats: true, error: null });
        try {
          const response = await userAPI.getUserStats(userId);
          const stats = response.data.data;

          set(state => ({
            userStats: {
              ...state.userStats,
              [userId]: stats,
            },
            isLoadingStats: false,
          }));

          return stats;
        } catch (error) {
          set({ error: error.message, isLoadingStats: false });
          console.error('Error fetching user stats:', error);
          return null;
        }
      },

      // Upload avatar
      uploadAvatar: async file => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.uploadAvatar(file);
          const result = response.data;

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          console.error('Error uploading avatar:', error);
          throw error;
        }
      },

      // Get user details from cache
      getUserDetailsFromCache: userId => {
        return get().userDetails[userId] || null;
      },

      // Get user stats from cache
      getUserStatsFromCache: userId => {
        return get().userStats[userId] || null;
      },

      // Update user details in cache
      updateUserDetailsCache: (userId, details) => {
        set(state => ({
          userDetails: {
            ...state.userDetails,
            [userId]: { ...state.userDetails[userId], ...details },
          },
        }));
      },

      // Load solved problems
      loadSolvedProblems: async userId => {
        try {
          const response = await fetch(`/api/users/${userId}/solved`);
          const data = await response.json();
          if (data.success) {
            const solvedIds = data.data.map(problem => problem.id);
            set({ solvedProblems: solvedIds });
          }
        } catch (error) {
          console.error('Error loading solved problems:', error);
        }
      },

      // Add solved problem
      addSolvedProblem: problemId => {
        set(state => ({
          solvedProblems: [...new Set([...state.solvedProblems, problemId])],
        }));
      },

      // Clear user data
      clearUserData: () => {
        set({
          userDetails: {},
          userStats: {},
          solvedProblems: [],
        });
      },
    }),
    {
      name: 'user-storage',
      partialize: state => ({
        userDetails: state.userDetails,
        userStats: state.userStats,
        solvedProblems: state.solvedProblems,
      }),
    }
  )
);
