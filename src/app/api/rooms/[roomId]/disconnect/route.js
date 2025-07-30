import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { Liveblocks } from '@liveblocks/node';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

export async function POST(request, { params }) {
  try {
    const { roomId } = params;

    // Broadcast room end event to all connected users
    await liveblocks.broadcastEvent(roomId, {
      type: 'room-force-disconnect',
      data: { reason: 'Host ended session' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Room disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect users' },
      { status: 500 }
    );
  }
}
