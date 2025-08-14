import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { User, Problem, Submission } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get recent users
    const recentUsers = await db
      .select({
        id: User.id,
        username: User.username,
        email: User.email,
        firstName: User.firstName,
        lastName: User.lastName,
        role: User.role,
        createdAt: User.createdAt,
      })
      .from(User)
      .orderBy(desc(User.createdAt))
      .limit(10);

    // Get recent problems
    const recentProblems = await db
      .select({
        id: Problem.id,
        title: Problem.title,
        difficulty: Problem.difficulty,
        createdAt: Problem.createdAt,
      })
      .from(Problem)
      .orderBy(desc(Problem.createdAt))
      .limit(10);

    // Get recent submissions
    const recentSubmissions = await db
      .select({
        id: Submission.id,
        status: Submission.status,
        language: Submission.language,
        createdAt: Submission.createdAt,
        userId: Submission.userId,
        problemId: Submission.problemId,
      })
      .from(Submission)
      .orderBy(desc(Submission.createdAt))
      .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        recentUsers,
        recentProblems,
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching admin dashboard data',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
