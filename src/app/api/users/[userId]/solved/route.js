import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Submission, Problem } from '@/lib/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    // Get all accepted submissions for this user
    const solvedSubmissions = await db
      .select({
        problemId: Submission.problemId,
        createdAt: Submission.createdAt,
      })
      .from(Submission)
      .where(
        and(eq(Submission.userId, userId), eq(Submission.status, 'accepted'))
      )
      .orderBy(desc(Submission.createdAt));

    // Unique solved problems, most recent first
    const uniqueProblems = [];
    const seen = new Set();
    for (const sub of solvedSubmissions) {
      if (!seen.has(sub.problemId)) {
        uniqueProblems.push(sub);
        seen.add(sub.problemId);
      }
    }
    const totalSolved = uniqueProblems.length;
    const paginated = uniqueProblems.slice(offset, offset + limit);

    // Fetch problem details
    let problems = [];
    if (paginated.length > 0) {
      const ids = paginated.map(p => p.problemId);
      problems = await db
        .select()
        .from(Problem)
        .where(inArray(Problem.id, ids));
    }

    return NextResponse.json({
      success: true,
      data: problems,
      total: totalSolved,
      page,
      totalPages: Math.ceil(totalSolved / limit),
    });
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching solved problems',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
