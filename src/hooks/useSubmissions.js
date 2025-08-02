import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemAPI } from '@/api/api';

export const useSubmissions = problemId => {
  return useQuery({
    queryKey: ['submissions', problemId],
    queryFn: async () => {
      const response = await problemAPI.getSubmissions(problemId);
      return response.data || response; // Handle both wrapped and unwrapped responses
    },
    enabled: !!problemId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSubmitSolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ problemId, code, language }) => {
      return await problemAPI.submit({ problemId, code, language });
    },
    onSuccess: (data, variables) => {
      // Invalidate submissions for this problem
      queryClient.invalidateQueries(['submissions', variables.problemId]);
      // Update user progress
      queryClient.invalidateQueries(['user-progress']);
    },
    onError: error => {
      console.error('Submission failed:', error);
    },
  });
};

export const useTestSolution = () => {
  return useMutation({
    mutationFn: async ({ problemId, code, language, testCases }) => {
      return await problemAPI.test({ problemId, code, language, testCases });
    },
  });
};
