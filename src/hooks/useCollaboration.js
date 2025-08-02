import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useRoomData = roomId => {
  return useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${roomId}`);
      if (!response.ok) throw new Error('Failed to fetch room data');
      return response.json();
    },
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useRoomParticipants = roomId => {
  return useQuery({
    queryKey: ['room-participants', roomId],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${roomId}/participants`);
      if (!response.ok) throw new Error('Failed to fetch participants');
      return response.json();
    },
    enabled: !!roomId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, problemId }) => {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId }),
      });
      if (!response.ok) throw new Error('Failed to join room');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['room', variables.roomId]);
      queryClient.invalidateQueries(['room-participants', variables.roomId]);
    },
  });
};

export const useLeaveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async roomId => {
      const response = await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to leave room');
      return response.json();
    },
    onSuccess: (data, roomId) => {
      queryClient.invalidateQueries(['room', roomId]);
      queryClient.invalidateQueries(['room-participants', roomId]);
    },
  });
};
