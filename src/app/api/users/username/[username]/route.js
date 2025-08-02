import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User } from '@/lib/schema/user';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    const user = await db
      .select({
        id: User.id,
        email: User.email,
        username: User.username,
        firstName: User.firstName,
        lastName: User.lastName,
        profilePicture: User.profilePicture,
        role: User.role,
        isVerified: User.isVerified,
        createdAt: User.createdAt,
      })
      .from(User)
      .where(eq(User.username, username))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user[0],
    });
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
