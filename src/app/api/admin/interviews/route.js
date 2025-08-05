import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { interviews } from '@/lib/schema/interview';
import { User } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    // Only allow admin access
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const interviewsWithUsers = await db
      .select({
        id: interviews.id,
        position: interviews.position,
        companyName: interviews.companyName,
        interviewType: interviews.interviewType,
        difficulty: interviews.difficulty,
        duration: interviews.duration,
        status: interviews.status,
        feedback: interviews.feedback,
        rating: interviews.rating,
        createdAt: interviews.createdAt,
        updatedAt: interviews.updatedAt,
        user: {
          id: User.id,
          name: User.firstName,
          email: User.email,
        },
      })
      .from(interviews)
      .leftJoin(User, eq(interviews.userId, User.id))
      .orderBy(interviews.createdAt);

    return NextResponse.json({
      success: true,
      data: interviewsWithUsers,
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
