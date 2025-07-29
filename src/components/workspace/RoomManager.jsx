'use client';

import { useEffect } from 'react';
import { useRoom } from '../../../liveblocks.config';

export function RoomManager({ onRoomClosed }) {
  const room = useRoom();

  useEffect(() => {
    if (!room) return;

    // Listen for room events
    const handleRoomEvent = event => {
      if (event.type === 'room-closed' || event.type === 'host-left') {
        onRoomClosed?.();
      }
    };

    // Cleanup when component unmounts (user leaves)
    return () => {
      // Close room if this was the host
      const isHost = localStorage.getItem(`room-host-${room.id}`) === 'true';
      if (isHost) {
        const cleanupRoom = async () => {
          const { roomStateManager } = await import('@/utils/roomState');
          const { useAuthStore } = await import('@/store/authStore');
          const authUser = useAuthStore.getState().authUser;

          if (authUser) {
            await roomStateManager.endRoom(
              room.id.replace('collab-', ''),
              authUser.id
            );
          }

          localStorage.removeItem(`room-host-${room.id}`);
          // Broadcast room closure to other users
          room.broadcastEvent({ type: 'room-closed' });
        };

        cleanupRoom();
      }
    };
  }, [room, onRoomClosed]);

  return null;
}
