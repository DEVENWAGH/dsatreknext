import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { db } from '@/lib/db';
import { Submission } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { problemId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    let query = db
      .select()
      .from(Submission)
      .where(
        and(
          eq(Submission.problemId, problemId),
          eq(Submission.status, 'accepted')
        )
      )
      .orderBy(desc(Submission.createdAt));

    // If userId is provided, filter by user
    if (userId) {
      query = query.where(
        and(
          eq(Submission.problemId, problemId),
          eq(Submission.userId, userId),
          eq(Submission.status, 'accepted')
        )
      );
    }

    const submissions = await query;

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Get solved submissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
