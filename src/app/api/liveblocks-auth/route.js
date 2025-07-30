import { Liveblocks } from '@liveblocks/node';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

export async function POST(request) {
  try {
    // Get user from auth directly
    const session = await auth();
    const user = session?.user;
    const isAuthenticated = !!user;

    // Get room from request body
    const body = await request.json();
    const { room } = body;

    let session_result;
    let userInfo;

    if (isAuthenticated && user) {
      // Create user info for authenticated user
      userInfo = {
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.name || user.email?.split('@')[0] || 'Anonymous',
        avatar: user.profilePicture || user.image || '',
      };

      // Create session for authenticated user
      session_result = await liveblocks.prepareSession(user.id, {
        userInfo,
      });

      if (room) {
        // Grant full access to authenticated users
        session_result.allow(room, session_result.FULL_ACCESS);
      }
    } else {
      // Create guest session for non-authenticated users
      const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      userInfo = {
        name: 'Guest User',
        avatar: '',
      };

      session_result = await liveblocks.prepareSession(guestId, {
        userInfo,
      });

      if (room) {
        // Grant read-only access to guests
        session_result.allow(room, session_result.READ_ACCESS);
      }
    }

    // Authorize the user and return the result
    const { status, body: responseBody } = await session_result.authorize();
    return new Response(responseBody, { status });
  } catch (error) {
    console.error('Liveblocks auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
