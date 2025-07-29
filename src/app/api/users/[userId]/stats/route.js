import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User, Submission, Problem } from '@/lib/schema';
import { eq, and, count } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userResult = await db
      .select({
        id: User.id,
      })
      .from(User)
      .where(eq(User.id, userId))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get accepted submissions with problem details
    const acceptedSubmissions = await db
      .select({
        problemId: Submission.problemId,
        difficulty: Problem.difficulty,
      })
      .from(Submission)
      .innerJoin(Problem, eq(Submission.problemId, Problem.id))
      .where(
        and(eq(Submission.userId, userId), eq(Submission.status, 'accepted'))
      );

    // Get total submissions count
    const totalSubmissionsResult = await db
      .select({ count: count() })
      .from(Submission)
      .where(eq(Submission.userId, userId));

    // Calculate unique solved problems by difficulty
    const uniqueProblems = new Map();
    acceptedSubmissions.forEach(sub => {
      if (!uniqueProblems.has(sub.problemId)) {
        uniqueProblems.set(
          sub.problemId,
          sub.difficulty?.toLowerCase() || 'unknown'
        );
      }
    });

    const solvedByDifficulty = { easy: 0, medium: 0, hard: 0 };
    uniqueProblems.forEach(difficulty => {
      if (difficulty in solvedByDifficulty) {
        solvedByDifficulty[difficulty]++;
      }
    });

    const stats = {
      totalSubmissions: totalSubmissionsResult[0]?.count || 0,
      totalSolved: uniqueProblems.size,
      currentStreak: 0, // TODO: Calculate actual streak
      rank: 0, // TODO: Calculate actual rank
      solvedByDifficulty,
      solvedByLanguage: {
        javascript: 0,
        python: 0,
        java: 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
