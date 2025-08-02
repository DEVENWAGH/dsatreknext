import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useCommunityPosts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ['community-posts', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam,
        ...filters,
      });
      const response = await fetch(`/api/community/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    getNextPageParam: lastPage =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    staleTime: 30 * 1000, // 30 seconds for real-time feel
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
};

export const useCommunityPost = postId => {
  return useQuery({
    queryKey: ['community-post', postId],
    queryFn: async () => {
      const response = await fetch(`/api/community/posts/${postId}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      return response.json();
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async postData => {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['community-posts']);
    },
  });
};

export const useVotePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, voteType }) => {
      const response = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onMutate: async ({ postId, voteType }) => {
      // Optimistic update
      await queryClient.cancelQueries(['community-post', postId]);
      const previousPost = queryClient.getQueryData(['community-post', postId]);

      if (previousPost) {
        queryClient.setQueryData(['community-post', postId], {
          ...previousPost,
          votes: previousPost.votes + (voteType === 'up' ? 1 : -1),
          userVote: voteType,
        });
      }

      return { previousPost };
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          ['community-post', variables.postId],
          context.previousPost
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries(['community-post', variables.postId]);
    },
  });
};
