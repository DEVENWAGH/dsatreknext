import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { Submission, Problem, User } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const problemId = searchParams.get('problemId');
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'streak', 'solved', etc.
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    // Validate userId - reject if it's undefined, null, or "undefined" string
    if (userId && (userId === 'undefined' || userId === 'null')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid user ID',
        },
        { status: 400 }
      );
    }

    // Handle specific types
    if (type === 'streak' && userId) {
      // Get submissions for streak calculation
      const submissions = await db
        .select({
          id: Submission.id,
          userId: Submission.userId,
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
          and(eq(Submission.userId, userId), eq(Submission.status, 'accepted'))
        )
        .orderBy(desc(Submission.createdAt))
        .limit(100);

      return NextResponse.json({
        success: true,
        data: submissions,
      });
    }

    if (type === 'solved' && userId) {
      // Get all solved problems by user
      const solvedSubmissions = await db
        .select({
          id: Submission.id,
          userId: Submission.userId,
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
          and(eq(Submission.userId, userId), eq(Submission.status, 'accepted'))
        )
        .orderBy(desc(Submission.createdAt));

      return NextResponse.json({
        success: true,
        data: solvedSubmissions,
      });
    }

    let query = db
      .select({
        id: Submission.id,
        code: Submission.code,
        language: Submission.language,
        status: Submission.status,
        runtime: Submission.runtime,
        memory: Submission.memory,
        testCasesPassed: Submission.testCasesPassed,
        totalTestCases: Submission.totalTestCases,
        createdAt: Submission.createdAt,
        user: {
          id: User.id,
          username: User.username,
        },
        problem: {
          id: Problem.id,
          title: Problem.title,
          difficulty: Problem.difficulty,
        },
      })
      .from(Submission)
      .leftJoin(User, eq(Submission.userId, User.id))
      .leftJoin(Problem, eq(Submission.problemId, Problem.id))
      .orderBy(desc(Submission.createdAt))
      .limit(limit)
      .offset(offset);

    // Apply filters
    const conditions = [];

    if (userId && userId !== 'undefined' && userId !== 'null') {
      conditions.push(eq(Submission.userId, userId));
    }

    if (problemId) {
      conditions.push(eq(Submission.problemId, problemId));
    }

    if (status) {
      conditions.push(eq(Submission.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const submissions = await query;

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
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

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      problemId,
      code,
      language,
      status,
      runtime,
      memory,
      testCasesPassed,
      totalTestCases,
    } = body;

    if (!userId || !problemId || !code || !language || !status) {
      return NextResponse.json(
        {
          success: false,
          message:
            'User ID, Problem ID, code, language, and status are required',
        },
        { status: 400 }
      );
    }

    const newSubmission = await db
      .insert(Submission)
      .values({
        userId,
        problemId,
        code,
        language,
        status,
        runtime,
        memory,
        testCasesPassed,
        totalTestCases,
      })
      .returning();

    // Update problem statistics if submission is accepted
    if (status === 'accepted') {
      await db
        .update(Problem)
        .set({
          acceptedSubmissions: (
            parseInt(Problem.acceptedSubmissions) + 1
          ).toString(),
          totalSubmissions: (parseInt(Problem.totalSubmissions) + 1).toString(),
        })
        .where(eq(Problem.id, problemId));
    } else {
      await db
        .update(Problem)
        .set({
          totalSubmissions: (parseInt(Problem.totalSubmissions) + 1).toString(),
        })
        .where(eq(Problem.id, problemId));
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Submission created successfully',
        data: newSubmission[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating submission',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
