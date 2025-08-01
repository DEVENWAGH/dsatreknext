import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
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
