// Room state management
const ROOM_STATES = {
  ACTIVE: 'active',
  ENDED: 'ended',
  EXPIRED: 'expired',
};

class RoomStateManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId, hostId) {
    const roomData = {
      state: ROOM_STATES.ACTIVE,
      hostId,
      createdAt: Date.now(),
      endedAt: null,
    };

    this.rooms.set(roomId, roomData);
    localStorage.setItem(`room-${roomId}`, JSON.stringify(roomData));

    // Auto-cleanup after 2 hours
    setTimeout(
      async () => {
        await this.autoExpireRoom(roomId);
      },
      2 * 60 * 60 * 1000
    ); // 2 hours
  }

  async endRoom(roomId, userId) {
    if (roomId && userId) {
      // Mark room as ended on server
      try {
        await fetch(`/api/rooms/${roomId}/status`, { method: 'POST' });
        await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to end room on server:', error);
      }

      // Clean up locally
      this.cleanupRoom(roomId);

      return true;
    }
    return false;
  }

  getRoomState(roomId) {
    // Check memory first
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId);
    }

    // Check localStorage
    const stored = localStorage.getItem(`room-${roomId}`);
    if (stored) {
      const room = JSON.parse(stored);
      this.rooms.set(roomId, room);
      return room;
    }

    return null;
  }

  async autoExpireRoom(roomId) {
    const room = this.getRoomState(roomId);
    if (room && room.state === ROOM_STATES.ACTIVE) {
      // End room properly with cleanup
      await this.endRoom(roomId, room.hostId || 'system');

      // Broadcast expiry to users
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('room-expired', {
            detail: { roomId },
          })
        );
      }
    }
  }

  async joinRoom(roomId, userId) {
    // Check if room is accessible first
    const isAccessible = await this.isRoomAccessible(roomId);
    if (!isAccessible) {
      return false; // Cannot join ended/expired room
    }

    // When a user joins a room, create a minimal record for them only if room is accessible
    if (!this.getRoomState(roomId)) {
      const joinedRoom = {
        state: ROOM_STATES.ACTIVE,
        hostId: null, // Unknown for joiners
        createdAt: Date.now(), // Use join time as reference
        endedAt: null,
        isJoiner: true,
      };

      this.rooms.set(roomId, joinedRoom);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(joinedRoom));
    }
    return true;
  }

  cleanupRoom(roomId) {
    // Remove from memory and localStorage immediately
    this.rooms.delete(roomId);
    localStorage.removeItem(`room-${roomId}`);
  }

  async isRoomAccessible(roomId) {
    // Check server-side room status
    try {
      const response = await fetch(`/api/rooms/${roomId}/status`);
      const data = await response.json();

      if (data.ended) {
        return false;
      }
    } catch (error) {
      console.error('Failed to check room status:', error);
    }

    return true;
  }
}

export const roomStateManager = new RoomStateManager();
export { ROOM_STATES };
