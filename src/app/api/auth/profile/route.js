import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { User } from '@/lib/schema/user';
import { UserProfile } from '@/lib/schema/user-profile';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await db
      .select()
      .from(User)
      .where(eq(User.id, session.user.id))
      .limit(1);

    if (!user.length) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get user profile if exists
    const userProfile = await db
      .select()
      .from(UserProfile)
      .where(eq(UserProfile.userId, session.user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        ...user[0],
        ...userProfile[0],
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      username,
      bio,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    } = body;

    // Check if username is taken (if username is provided and different)
    if (username) {
      const existingUser = await db
        .select()
        .from(User)
        .where(eq(User.username, username))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
        return NextResponse.json(
          { success: false, message: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Update user basic info
    const updatedUser = await db
      .update(User)
      .set({
        firstName,
        lastName,
        email,
        ...(username && { username }),
        updatedAt: new Date(),
      })
      .where(eq(User.id, session.user.id))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 400 }
      );
    }

    // Update or create user profile
    const existingProfile = await db
      .select()
      .from(UserProfile)
      .where(eq(UserProfile.userId, session.user.id))
      .limit(1);

    let updatedProfile;
    if (existingProfile.length > 0) {
      // Update existing profile
      updatedProfile = await db
        .update(UserProfile)
        .set({
          bio,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
          updatedAt: new Date(),
        })
        .where(eq(UserProfile.userId, session.user.id))
        .returning();
    } else {
      // Create new profile
      updatedProfile = await db
        .insert(UserProfile)
        .values({
          userId: session.user.id,
          bio,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser[0],
        ...updatedProfile[0],
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
