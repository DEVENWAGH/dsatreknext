import { NextResponse } from 'next/server';

import { Liveblocks } from '@liveblocks/node';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

const ROOM_EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2 hours

export async function POST() {
  try {
    // Get all rooms
    const { data: rooms } = await liveblocks.getRooms();
    const now = Date.now();
    const expiredRooms = [];

    for (const room of rooms) {
      const roomAge = now - new Date(room.createdAt).getTime();

      // Check if room is older than 2 hours
      if (roomAge > ROOM_EXPIRY_TIME) {
        try {
          await liveblocks.deleteRoom(room.id);
          expiredRooms.push(room.id);
        } catch (error) {
          console.error(`Failed to delete room ${room.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      cleaned: expiredRooms.length,
      rooms: expiredRooms,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
