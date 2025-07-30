import { auth } from '@/auth';

export const runtime = 'nodejs';
import { db } from '@/lib/db';
import { User } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const PATCH = auth(async function PATCH(req, { params }) {
  try {
    const session = req.auth;

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get the user to check current role
    const user = await db
      .select()
      .from(User)
      .where(eq(User.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Toggle role: admin <-> user
    const currentRole = user[0].role;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    // Update user role
    const [updatedUser] = await db
      .update(User)
      .set({
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(User.id, userId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `User role changed from ${currentRole} to ${newRole}`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
