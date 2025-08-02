import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useUserProgress = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['user-progress', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/user/progress');
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSolvedProblems = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['solved-problems', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/user/solved-problems');
      if (!response.ok) throw new Error('Failed to fetch solved problems');
      return response.json();
    },
    enabled: !!session?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async progressData => {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData),
      });
      if (!response.ok) throw new Error('Failed to update progress');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-progress', session?.user?.id]);
      queryClient.invalidateQueries(['solved-problems', session?.user?.id]);
    },
  });
};
