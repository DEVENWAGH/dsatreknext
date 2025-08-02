import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemAPI } from '@/api/api';

export const useProblems = () => {
  return useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      try {
        // Fetch problems and companies in parallel
        const [problemsResponse, companiesResponse] = await Promise.all([
          problemAPI.getAll(),
          fetch('/api/companies')
            .then(res => res.json())
            .catch(() => ({ success: false, data: [] })),
        ]);

        console.log('Problems API Response:', problemsResponse);

        let problems = [];

        // Handle different response structures
        if (problemsResponse.success && problemsResponse.data?.problems) {
          problems = problemsResponse.data.problems;
        } else if (problemsResponse.data?.data?.problems) {
          problems = problemsResponse.data.data.problems;
        } else if (problemsResponse.data?.problems) {
          problems = problemsResponse.data.problems;
        } else if (Array.isArray(problemsResponse.data?.data)) {
          problems = problemsResponse.data.data;
        } else if (Array.isArray(problemsResponse.data)) {
          problems = problemsResponse.data;
        } else if (Array.isArray(problemsResponse)) {
          problems = problemsResponse;
        }

        // Ensure problems is an array
        if (!Array.isArray(problems)) {
          console.warn('Problems is not an array:', problems);
          problems = [];
        }

        console.log('Parsed problems:', problems.length, 'items');

        // Create company map for quick lookups
        const companyMap = {};
        if (companiesResponse.success && companiesResponse.data) {
          companiesResponse.data.forEach(company => {
            companyMap[company.id] = company;
          });
        }

        // Enrich problems with company data
        return problems.map(problem => ({
          ...problem,
          companyData:
            problem.companies?.map(id => companyMap[id]).filter(Boolean) || [],
        }));
      } catch (error) {
        console.error('Error in useProblems:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useProblem = problemId => {
  return useQuery({
    queryKey: ['problem', problemId],
    queryFn: async () => {
      const response = await problemAPI.getById(problemId);
      return response.success
        ? response.problem
        : response.data?.problem || response.problem;
    },
    enabled: !!problemId,
    staleTime: 15 * 60 * 1000,
  });
};

export const usePrefetchProblem = () => {
  const queryClient = useQueryClient();

  return problemId => {
    queryClient.prefetchQuery({
      queryKey: ['problem', problemId],
      queryFn: async () => {
        const response = await problemAPI.getById(problemId);
        return response.success
          ? response.problem
          : response.data?.problem || response.problem;
      },
      staleTime: 15 * 60 * 1000,
    });
  };
};
