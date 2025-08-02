import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Optimized React Query hooks for problem data fetching
 * Provides better caching, background updates, and error handling
 */

// Query keys for consistent caching
export const QUERY_KEYS = {
  problems: ['problems'],
  problemsPaginated: (page, limit, filters) => [
    'problems',
    'paginated',
    { page, limit, ...filters },
  ],
  problem: id => ['problems', id],
  companies: ['companies'],
  tags: ['tags'],
};

/**
 * Fetch problems with pagination and filtering
 */
export const useProblems = (options = {}) => {
  const {
    page = 1,
    limit = 10,
    difficulty,
    search,
    tags,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: QUERY_KEYS.problemsPaginated(page, limit, {
      difficulty,
      search,
      tags,
    }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(difficulty && { difficulty }),
        ...(search && { search }),
        ...(tags && { tags: tags.join(',') }),
      });

      const response = await fetch(`/api/problems?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true, // Keep previous data while fetching new data
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Infinite scroll implementation for problems
 */
export const useInfiniteProblems = (options = {}) => {
  const { limit = 20, difficulty, search, tags, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: ['problems', 'infinite', { difficulty, search, tags }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: limit.toString(),
        ...(difficulty && { difficulty }),
        ...(search && { search }),
        ...(tags && { tags: tags.join(',') }),
      });

      const response = await fetch(`/api/problems?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      return response.json();
    },
    enabled,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.problems.length < limit) return undefined;
      return pages.length + 1;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch single problem with details
 */
export const useProblem = (problemId, options = {}) => {
  const { enabled = !!problemId } = options;

  return useQuery({
    queryKey: QUERY_KEYS.problem(problemId),
    queryFn: async () => {
      const response = await fetch(`/api/problems/${problemId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch problem');
      }
      return response.json();
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual problems
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
  });
};

/**
 * Prefetch adjacent problems for better navigation experience
 */
export const usePrefetchAdjacentProblems = (currentProblemId, allProblems) => {
  const queryClient = useQueryClient();

  const adjacentProblems = useMemo(() => {
    if (!currentProblemId || !allProblems?.length) return [];

    const currentIndex = allProblems.findIndex(p => p.id === currentProblemId);
    if (currentIndex === -1) return [];

    const adjacent = [];
    if (currentIndex > 0) adjacent.push(allProblems[currentIndex - 1]);
    if (currentIndex < allProblems.length - 1)
      adjacent.push(allProblems[currentIndex + 1]);

    return adjacent;
  }, [currentProblemId, allProblems]);

  // Prefetch adjacent problems
  React.useEffect(() => {
    adjacentProblems.forEach(problem => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.problem(problem.id),
        queryFn: async () => {
          const response = await fetch(`/api/problems/${problem.id}`);
          if (!response.ok) throw new Error('Failed to prefetch problem');
          return response.json();
        },
        staleTime: 10 * 60 * 1000,
      });
    });
  }, [adjacentProblems, queryClient]);
};

/**
 * Fetch companies with caching
 */
export const useCompanies = () => {
  return useQuery({
    queryKey: QUERY_KEYS.companies,
    queryFn: async () => {
      const response = await fetch('/api/companies');
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
};

/**
 * Batch fetch multiple problems
 */
export const useBatchProblems = (problemIds, options = {}) => {
  const { enabled = problemIds?.length > 0 } = options;

  return useQuery({
    queryKey: ['problems', 'batch', problemIds?.sort()],
    queryFn: async () => {
      const response = await fetch('/api/problems/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: problemIds }),
      });
      if (!response.ok) {
        throw new Error('Failed to batch fetch problems');
      }
      return response.json();
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};

/**
 * Optimized search with debouncing
 */
export const useSearchProblems = (searchQuery, options = {}) => {
  const { debounceMs = 300, enabled = true, minLength = 2 } = options;

  const debouncedQuery = useDebounce(searchQuery, debounceMs);
  const shouldSearch =
    enabled && debouncedQuery && debouncedQuery.length >= minLength;

  return useQuery({
    queryKey: ['problems', 'search', debouncedQuery],
    queryFn: async () => {
      const response = await fetch(
        `/api/problems/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!response.ok) {
        throw new Error('Failed to search problems');
      }
      return response.json();
    },
    enabled: shouldSearch,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Mutation for updating problem data
 */
export const useUpdateProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ problemId, data }) => {
      const response = await fetch(`/api/problems/${problemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update problem');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.problem(variables.problemId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.problems });
    },
  });
};

/**
 * Custom debounce hook
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
