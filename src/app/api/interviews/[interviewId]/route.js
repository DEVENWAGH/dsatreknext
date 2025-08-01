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
      .select()
      .from(interviews)
      .where(
        and(
          eq(interviews.id, interviewId),
          eq(interviews.userId, session.user.id)
        )
      );

    if (!interview || interview.length === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: interview[0],
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interviewId } = await params;
    const body = await request.json();
    const { status, feedback, rating } = body;

    const validStatuses = ['scheduled', 'pending', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (feedback) updateData.feedback = feedback;
    if (rating) updateData.rating = rating;
    updateData.updatedAt = new Date();

    const updatedInterview = await db
      .update(interviews)
      .set(updateData)
      .where(
        and(
          eq(interviews.id, interviewId),
          eq(interviews.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedInterview || updatedInterview.length === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interview updated successfully',
      data: updatedInterview[0],
    });
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
