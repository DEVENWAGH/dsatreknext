import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { User } from '@/lib/schema';
import { UserProfile } from '@/lib/schema/user-profile';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await db
      .select()
      .from(User)
      .where(eq(User.id, userId))
      .limit(1);

    if (!user?.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user profile if exists
    const userProfile = await db
      .select()
      .from(UserProfile)
      .where(eq(UserProfile.userId, userId))
      .limit(1);

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user[0];

    return NextResponse.json({
      success: true,
      data: {
        ...userWithoutPassword,
        ...userProfile[0],
      },
    });
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const updateData = await request.json();

    // Only allow users to update their own profile
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update user basic info
    if (updateData.username) {
      // Check if username is already taken
      const existingUser = await db
        .select()
        .from(User)
        .where(eq(User.username, updateData.username))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }

      await db
        .update(User)
        .set({
          username: updateData.username,
          updatedAt: new Date(),
        })
        .where(eq(User.id, userId));
    }

    // Update or create user profile
    const profileData = {
      userId,
      gender: updateData.gender,
      location: updateData.location,
      birthday: updateData.birthday,
      summary: updateData.summary,
      website: updateData.website,
      github: updateData.github,
      linkedin: updateData.linkedin,
      twitter: updateData.twitter,
      experience: JSON.stringify(updateData.experience || []),
      education: JSON.stringify(updateData.education || []),
      skills: JSON.stringify(updateData.skills || []),
      updatedAt: new Date(),
    };

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(UserProfile)
      .where(eq(UserProfile.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(UserProfile)
        .set(profileData)
        .where(eq(UserProfile.userId, userId));
    } else {
      // Create new profile
      await db.insert(UserProfile).values({
        ...profileData,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
