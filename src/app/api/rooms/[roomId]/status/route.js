import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Simple in-memory store for ended rooms (in production, use database)
const endedRooms = new Set();

export async function GET(request, { params }) {
  const { roomId } = await params;

  return NextResponse.json({
    ended: endedRooms.has(roomId),
  });
}

export async function POST(request, { params }) {
  const { roomId } = await params;

  // Mark room as ended
  endedRooms.add(roomId);

  return NextResponse.json({ success: true });
}
