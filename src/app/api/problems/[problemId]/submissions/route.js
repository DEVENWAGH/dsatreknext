import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Submission } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { problemId } = await params;

    if (!problemId) {
      return NextResponse.json(
        { success: false, message: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // Get submissions for this problem by the current user
    const submissions = await db
      .select({
        id: Submission.id,
        problemId: Submission.problemId,
        code: Submission.code,
        language: Submission.language,
        status: Submission.status,
        runtime: Submission.runtime,
        memory: Submission.memory,
        testCasesPassed: Submission.testCasesPassed,
        totalTestCases: Submission.totalTestCases,
        createdAt: Submission.createdAt,
      })
      .from(Submission)
      .where(
        and(
          eq(Submission.problemId, problemId),
          eq(Submission.userId, session.user.id)
        )
      )
      .orderBy(desc(Submission.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Error fetching problem submissions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching submissions',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
