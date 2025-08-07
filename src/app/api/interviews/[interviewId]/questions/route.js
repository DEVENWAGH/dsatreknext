import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { interviews } from '@/lib/schema/interview';
import { eq, and } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interviewId } = await params;

    const interview = await db
      .select({
        questions: interviews.questions,
        position: interviews.position,
        interviewType: interviews.interviewType,
        difficulty: interviews.difficulty,
      })
      .from(interviews)
      .where(
        and(
          eq(interviews.id, interviewId),
          eq(interviews.userId, session.user.id)
        )
      )
      .limit(1);

    if (!interview || interview.length === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        questions: interview[0].questions,
        position: interview[0].position,
        interviewType: interview[0].interviewType,
        difficulty: interview[0].difficulty,
      },
    });
  } catch (error) {
    console.error('Error fetching interview questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interviewId } = await params;
    const body = await request.json();
    const { questionIndex, response } = body;

    // Validate input
    if (questionIndex === undefined) {
      return NextResponse.json(
        { error: 'Question index is required' },
        { status: 400 }
      );
    }

    // Get the interview
    const interview = await db
      .select()
      .from(interviews)
      .where(
        and(
          eq(interviews.id, interviewId),
          eq(interviews.userId, session.user.id)
        )
      )
      .limit(1);

    if (!interview || interview.length === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Get the questions array
    const questions = interview[0].questions || [];

    // Ensure question index is valid
    if (questionIndex < 0 || questionIndex >= questions.length) {
      return NextResponse.json(
        { error: 'Invalid question index' },
        { status: 400 }
      );
    }

    // Update the question with user's response
    questions[questionIndex].userResponse = response;

    // Save the updated questions array
    const updatedInterview = await db
      .update(interviews)
      .set({
        questions: questions,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(interviews.id, interviewId),
          eq(interviews.userId, session.user.id)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Response saved successfully',
      data: updatedInterview[0],
    });
  } catch (error) {
    console.error('Error updating interview question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
