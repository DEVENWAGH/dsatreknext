import { useEffect, useCallback } from 'react';
import {
  useAuthStore,
  useSubmissionStore,
  useCompanyStore,
  useProblemStore,
  useUserStore,
  useUIStore,
} from '@/store';

// Custom hook to manage store cleanup and initialization
export const useStoreManager = () => {
  const clearAllStores = useCallback(() => {
    useAuthStore.getState().clearUserData?.();
    useSubmissionStore.getState().clearSolvedProblems();
    useCompanyStore.getState().clearCompanyData();
    useProblemStore.getState().clearProblemData();
    useUserStore.getState().clearUserData();
    useUIStore.getState().resetUIState();
  }, []);

  const initializeStores = useCallback(async () => {
    const authUser = useAuthStore.getState().authUser;

    if (authUser) {
      // Initialize user-specific data
      try {
        await useSubmissionStore.getState().getSolvedProblems();
        await useCompanyStore.getState().getAllCompanies();
      } catch (error) {
        console.error('Error initializing stores:', error);
      }
    }
  }, []);

  return {
    clearAllStores,
    initializeStores,
  };
};

// Hook for handling authentication state changes
export const useAuthStateManager = () => {
  const { authUser } = useAuthStore();
  const { clearAllStores, initializeStores } = useStoreManager();

  useEffect(() => {
    if (authUser) {
      initializeStores();
    } else {
      clearAllStores();
    }
  }, [authUser, clearAllStores, initializeStores]);
};

// Hook for managing problem-related state
export const useProblemManager = () => {
  const { getProblem, getProblemFromCache } = useProblemStore();
  const { getCompanyById, getCompanyFromCache } = useCompanyStore();
  const { getSolvedProblemById, isProblemSolved } = useSubmissionStore();
  const { authUser } = useAuthStore();

  const getProblemWithDetails = async problemId => {
    try {
      // Get problem details
      let problem = getProblemFromCache(problemId);
      if (!problem) {
        const response = await getProblem(problemId);
        problem = response.data.data[0];
      }

      // Get company details
      if (problem?.companies) {
        const companyPromises = problem.companies.map(async companyId => {
          let company = getCompanyFromCache(companyId);
          if (!company) {
            company = await getCompanyById(companyId);
          }
          return company;
        });

        problem.companyDetails = await Promise.all(companyPromises);
      }

      // Get solved status (only if user is authenticated)
      const isSolved = authUser?.id
        ? isProblemSolved(problemId) ||
          (await getSolvedProblemById(problemId, authUser.id))
        : false;
      problem.isSolved = isSolved;

      return problem;
    } catch (error) {
      console.error('Error getting problem with details:', error);
      return null;
    }
  };

  return {
    getProblemWithDetails,
  };
};

// Hook for managing user profile data
export const useProfileManager = userId => {
  const { getUserDetails, getUserStats } = useUserStore();

  const getCompleteUserProfile = useCallback(async () => {
    if (!userId) return null;

    try {
      const [userDetails, userStats] = await Promise.all([
        getUserDetails(userId),
        getUserStats(userId),
      ]);

      return {
        ...userDetails,
        stats: userStats,
      };
    } catch (error) {
      console.error('Error getting complete user profile:', error);
      return null;
    }
  }, [userId, getUserDetails, getUserStats]);

  return {
    getCompleteUserProfile,
  };
};
