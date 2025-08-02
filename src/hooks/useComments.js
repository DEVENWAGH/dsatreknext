import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useComments = postId => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await fetch(`/api/community/posts/${postId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: !!postId,
    staleTime: 10 * 1000, // 10 seconds for real-time feel
    refetchInterval: 15 * 1000, // Auto-refetch every 15 seconds
  });

  const mutate = () => {
    queryClient.invalidateQueries(['comments', postId]);
  };

  return { ...query, mutate };
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }) => {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onMutate: async ({ postId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['comments', postId]);

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(['comments', postId]);

      // Optimistically update
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        content,
        username: 'You',
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      queryClient.setQueryData(['comments', postId], old => ({
        ...old,
        data: [optimisticComment, ...(old?.data || [])],
      }));

      return { previousComments };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['comments', variables.postId],
          context.previousComments
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['comments', variables.postId]);
      queryClient.invalidateQueries(['community-post', variables.postId]);
    },
  });
};
