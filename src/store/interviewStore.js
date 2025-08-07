import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InterviewAPI } from '@/api/api';
import { toast } from 'sonner';

export const useInterviewStore = create(
  persist(
    (set, get) => ({
      // State
      interviews: [],
      currentInterview: null,
      userInterviews: [],
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      error: null,

      // Initialize arrays if they don't exist
      initializeStore: () => {
        set(state => ({
          interviews: Array.isArray(state.interviews) ? state.interviews : [],
          userInterviews: Array.isArray(state.userInterviews)
            ? state.userInterViews
            : [],
        }));
      },

      // Create interview
      createInterview: async interviewData => {
        set({ isCreating: true, error: null });
        try {
          const response = await InterviewAPI.createInterview(interviewData);

          if (!response?.success) {
            throw new Error(response?.message || 'Failed to create interview');
          }

          const newInterview = response.data;

          set(state => {
            // Ensure we have safe defaults
            const safeState = {
              ...state,
              interviews: Array.isArray(state.interviews)
                ? state.interviews
                : [],
              userInterviews: Array.isArray(state.userInterViews)
                ? state.userInterViews
                : [],
            };

            const currentInterviews = safeState.interviews;
            const currentUserInterviews = safeState.userInterViews;

            return {
              interviews: [...currentInterviews, newInterview],
              userInterviews: [...currentUserInterviews, newInterview],
              isCreating: false,
              error: null,
            };
          });

          return newInterview;
        } catch (error) {
          set({ error: error.message, isCreating: false });
          toast.error(`Failed to create interview: ${error.message}`);
          throw error;
        }
      },

      // Get user interviews
      getUserInterviews: async (userId = null) => {
        set({ isLoading: true, error: null });
        try {
          const response = await InterviewAPI.getuserInterviews(userId);

          const interviews = response?.data || [];
          const interviewsArray = Array.isArray(interviews) ? interviews : [];

          set({
            userInterviews: interviewsArray,
            interviews: interviewsArray,
            isLoading: false,
            error: null,
          });

          return interviewsArray;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
            userInterviews: [],
            interviews: [],
          });
          return [];
        }
      },

      // Get interview by ID
      getInterviewById: async interviewId => {
        set({ isLoading: true, error: null });
        try {
          const response = await InterviewAPI.getInterviewById(interviewId);

          if (!response?.success) {
            throw new Error(response?.message || 'Failed to fetch interview');
          }

          const interview = response.data;

          set({
            currentInterview: interview,
            isLoading: false,
          });

          // Also update the interview in the arrays if it exists
          set(state => {
            const currentInterviews = Array.isArray(state.interviews)
              ? state.interviews
              : [];
            const currentUserInterviews = Array.isArray(state.userInterViews)
              ? state.userInterViews
              : [];

            return {
              interviews: currentInterviews.map(int =>
                int.id === interviewId ? interview : int
              ),
              userInterviews: currentUserInterviews.map(int =>
                int.id === interviewId ? interview : int
              ),
            };
          });

          return interview;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      // Update interview with feedback
      updateInterviewFeedback: async (interviewId, feedbackData) => {
        set({ isUpdating: true, error: null });
        try {
          const response = await InterviewAPI.updateInterviewStatus(
            interviewId,
            { ...feedbackData, status: 'completed' }
          );
          const updatedInterview = response?.data;

          set(state => {
            const currentInterviews = Array.isArray(state.interviews)
              ? state.interviews
              : [];
            const currentUserInterviews = Array.isArray(state.userInterViews)
              ? state.userInterViews
              : [];

            return {
              interviews: currentInterviews.map(interview =>
                interview.id === interviewId ? updatedInterview : interview
              ),
              userInterviews: currentUserInterviews.map(interview =>
                interview.id === interviewId ? updatedInterview : interview
              ),
              currentInterview:
                state.currentInterview?.id === interviewId
                  ? updatedInterview
                  : state.currentInterview,
              isUpdating: false,
            };
          });

          return updatedInterview;
        } catch (error) {
          set({ error: error.message, isUpdating: false });
          throw error;
        }
      },

      // Update interview status
      updateInterviewStatus: async (interviewId, statusData) => {
        set({ isUpdating: true, error: null });
        try {
          const response = await InterviewAPI.updateInterviewStatus(
            interviewId,
            statusData
          );
          const updatedInterview = response?.data;

          set(state => {
            const currentInterviews = Array.isArray(state.interviews)
              ? state.interviews
              : [];
            const currentUserInterviews = Array.isArray(state.userInterViews)
              ? state.userInterViews
              : [];

            return {
              interviews: currentInterviews.map(interview =>
                interview.id === interviewId ? updatedInterview : interview
              ),
              userInterviews: currentUserInterviews.map(interview =>
                interview.id === interviewId ? updatedInterview : interview
              ),
              currentInterview:
                state.currentInterview?.id === interviewId
                  ? updatedInterview
                  : state.currentInterview,
              isUpdating: false,
            };
          });

          // Status updated silently
          return updatedInterview;
        } catch (error) {
          set({ error: error.message, isUpdating: false });
          toast.error('Failed to update interview status');
          throw error;
        }
      },

      // Get interview from cache
      getInterviewFromCache: interviewId => {
        const state = get();
        const interviews = Array.isArray(state.interviews)
          ? state.interviews
          : [];
        return (
          interviews.find(interview => interview.id === interviewId) || null
        );
      },

      // Clear interview data
      clearInterviewData: () => {
        set({
          interviews: [],
          currentInterview: null,
          userInterviews: [],
        });
      },

      // Set current interview
      setCurrentInterview: interview => {
        set({ currentInterview: interview });
      },

      // Reset store (for debugging)
      resetStore: () => {
        set({
          interviews: [],
          currentInterview: null,
          userInterviews: [],
          isLoading: false,
          isCreating: false,
          isUpdating: false,
          error: null,
        });
      },
    }),
    {
      name: 'interview-storage',
      partialize: state => ({
        interviews: Array.isArray(state.interviews) ? state.interviews : [],
        userInterviews: Array.isArray(state.userInterViews)
          ? state.userInterViews
          : [],
      }),
      // Add migrate function to handle old data
      migrate: persistedState => {
        // Ensure arrays are properly initialized during migration
        return {
          ...persistedState,
          interviews: Array.isArray(persistedState?.interviews)
            ? persistedState.interviews
            : [],
          userInterviews: Array.isArray(persistedState?.userInterviews)
            ? persistedState.userInterviews
            : [],
        };
      },
      version: 2, // Increment version to force migration
    }
  )
);
