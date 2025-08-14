import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Submission, Problem } from '@/lib/schema';
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

    const { userId } = await params;

    // Only allow users to view their own submissions
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'accepted', 'pending', 'rejected'
    const problemId = searchParams.get('problemId');

    const offset = (page - 1) * limit;

    let whereConditions = [eq(Submission.userId, userId)];

    if (status) {
      whereConditions.push(eq(Submission.status, status));
    }

    if (problemId) {
      whereConditions.push(eq(Submission.problemId, problemId));
    }

    // Get submissions with problem details
    const submissions = await db
      .select({
        id: Submission.id,
        problemId: Submission.problemId,
        problemTitle: Problem.title,
        problemDifficulty: Problem.difficulty,
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
      .leftJoin(Problem, eq(Submission.problemId, Problem.id))
      .where(and(...whereConditions))
      .orderBy(desc(Submission.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalSubmissions = await db
      .select({ count: eq(Submission.userId, userId) })
      .from(Submission)
      .where(and(...whereConditions));

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total: totalSubmissions.length,
          totalPages: Math.ceil(totalSubmissions.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
