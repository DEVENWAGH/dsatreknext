import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { interviews } from '@/lib/schema/interview';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateInterviewQuestions } from '@/services/aiService';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userInterviews = await db
      .select()
      .from(interviews)
      .where(eq(interviews.userId, userId))
      .orderBy(desc(interviews.createdAt))
      .limit(6);

    return NextResponse.json({
      success: true,
      data: userInterviews,
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      position,
      companyName,
      jobDescription,
      interviewType,
      duration,
      difficulty,
      interviewerName,
      scheduledAt,
    } = body;

    if (!position || !interviewType || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Cleanup: Keep only latest 5 interviews before adding new one (total will be 6)
    const existingInterviews = await db
      .select({ id: interviews.id })
      .from(interviews)
      .where(eq(interviews.userId, session.user.id))
      .orderBy(desc(interviews.createdAt));

    if (existingInterviews.length >= 6) {
      const toDelete = existingInterviews.slice(5);
      for (const interview of toDelete) {
        await db.delete(interviews).where(eq(interviews.id, interview.id));
      }
    }

    const generatedQuestions = await generateInterviewQuestions({
      position,
      companyName,
      jobDescription,
      interviewType,
      duration,
      difficulty: difficulty || 'medium',
    });

    const interview = await db
      .insert(interviews)
      .values({
        id: uuidv4(),
        userId: session.user.id,
        position,
        companyName,
        jobDescription,
        interviewType,
        difficulty: difficulty || 'medium',
        duration,
        questions: generatedQuestions,
        interviewerName,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'scheduled',
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Interview created successfully',
      data: interview[0],
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}
