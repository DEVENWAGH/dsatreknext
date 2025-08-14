import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemAPI } from '@/api/api';

export const useProblems = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['problems', page, limit],
    queryFn: async () => {
      try {
        // Fetch problems and companies in parallel
        const [problemsResponse, companiesResponse] = await Promise.all([
          fetch(`/api/problems?page=${page}&limit=${limit}`).then(res =>
            res.json()
          ),
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
        const enrichedProblems = problems.map(problem => ({
          ...problem,
          companyData:
            problem.companies?.map(id => companyMap[id]).filter(Boolean) || [],
        }));

        // Return both problems and pagination info
        return {
          problems: enrichedProblems,
          pagination: problemsResponse.data?.pagination || {
            page: 1,
            limit: 10,
            total: enrichedProblems.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };
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
      const response = await fetch(`/api/problems/${problemId}`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch problem');
      }
      return data.problem;
    },
    enabled: !!problemId,
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
  });
};

export const usePrefetchProblem = () => {
  const queryClient = useQueryClient();

  return problemId => {
    // Only prefetch if not already cached
    const existingData = queryClient.getQueryData(['problem', problemId]);
    if (existingData) return;

    queryClient.prefetchQuery({
      queryKey: ['problem', problemId],
      queryFn: async () => {
        const response = await fetch(`/api/problems/${problemId}`);
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch problem');
        }
        return data.problem;
      },
      staleTime: 30 * 60 * 1000, // 30 minutes cache
      gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    });
  };
};
