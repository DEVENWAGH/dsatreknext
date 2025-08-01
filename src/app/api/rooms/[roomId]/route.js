import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { Liveblocks } from '@liveblocks/node';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

export async function DELETE(request, { params }) {
  try {
    const { roomId } = await params;

    // Delete room from Liveblocks
    await liveblocks.deleteRoom(roomId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Room deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { roomId } = await params;

    // Get room info from Liveblocks
    const room = await liveblocks.getRoom(roomId);

    return NextResponse.json({
      exists: true,
      createdAt: room.createdAt,
      lastConnectionAt: room.lastConnectionAt,
    });
  } catch (error) {
    if (error.message?.includes('not found')) {
      return NextResponse.json({ exists: false });
    }

    console.error('Room status error:', error);
    return NextResponse.json(
      { error: 'Failed to get room status' },
      { status: 500 }
    );
  }
}
