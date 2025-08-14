import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { User } from '@/lib/schema';
import { eq, count } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Get total count of users
    const [{ count: totalUsers }] = await db
      .select({ count: count() })
      .from(User);

    // Get users with pagination
    const users = await db
      .select({
        id: User.id,
        username: User.username,
        email: User.email,
        firstName: User.firstName,
        lastName: User.lastName,
        role: User.role,
        isVerified: User.isVerified,
        profilePicture: User.profilePicture,
        isSubscribed: User.isSubscribed,
        subscriptionExpiresAt: User.subscriptionExpiresAt,
        createdAt: User.createdAt,
      })
      .from(User)
      .limit(limit)
      .offset(offset)
      .orderBy(User.createdAt);

    return NextResponse.json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        data: users,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching users',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID and role are required',
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid role. Must be user or admin',
        },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await db
      .update(User)
      .set({ role })
      .where(eq(User.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Role changed to ${role} successfully`,
      data: {
        userId,
        newRole: role,
      },
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error changing user role',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
