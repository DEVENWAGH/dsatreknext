import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { Submission, Problem } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all solved problems by user (only accepted submissions)
    const solvedSubmissions = await db
      .select({
        id: Submission.id,
        problemId: Submission.problemId,
        userId: Submission.userId,
        language: Submission.language,
        status: Submission.status,
        createdAt: Submission.createdAt,
        problem: {
          id: Problem.id,
          title: Problem.title,
          difficulty: Problem.difficulty,
        },
      })
      .from(Submission)
      .leftJoin(Problem, eq(Submission.problemId, Problem.id))
      .where(
        and(eq(Submission.userId, userId), eq(Submission.status, 'accepted'))
      )
      .orderBy(desc(Submission.createdAt));

    return NextResponse.json({
      success: true,
      data: solvedSubmissions,
    });
  } catch (error) {
    console.error('Get solved submissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
