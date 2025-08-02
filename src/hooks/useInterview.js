import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useInterviews = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['interviews', session?.user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/interviews?userId=${session.user.id}`);
      if (!response.ok) throw new Error('Failed to fetch interviews');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInterview = interviewId => {
  return useQuery({
    queryKey: ['interview', interviewId],
    queryFn: async () => {
      const response = await fetch(`/api/interviews/${interviewId}`);
      if (!response.ok) throw new Error('Failed to fetch interview');
      return response.json();
    },
    enabled: !!interviewId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useInterviewAnalytics = interviewId => {
  return useQuery({
    queryKey: ['interview-analytics', interviewId],
    queryFn: async () => {
      const response = await fetch(`/api/interviews/${interviewId}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: !!interviewId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async interviewData => {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData),
      });
      if (!response.ok) throw new Error('Failed to create interview');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['interviews', session?.user?.id]);
    },
  });
};

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ interviewId, data }) => {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update interview');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['interview', variables.interviewId]);
      queryClient.invalidateQueries([
        'interview-analytics',
        variables.interviewId,
      ]);
    },
  });
};
