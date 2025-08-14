import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { DailyChallenge, Problem } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Format: "2025-01"

    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter required' },
        { status: 400 }
      );
    }

    const challenges = await db
      .select({
        id: DailyChallenge.id,
        day: DailyChallenge.day,
        challengeDate: DailyChallenge.challengeDate,
        problem: {
          id: Problem.id,
          title: Problem.title,
          difficulty: Problem.difficulty,
        },
      })
      .from(DailyChallenge)
      .leftJoin(Problem, eq(DailyChallenge.problemId, Problem.id))
      .where(eq(DailyChallenge.month, month));

    const challengeMap = {};
    challenges.forEach(challenge => {
      challengeMap[parseInt(challenge.day)] = challenge;
    });

    return NextResponse.json({ challenges: challengeMap });
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { problemId, challengeDate } = await request.json();

    if (!problemId || !challengeDate) {
      return NextResponse.json(
        { error: 'Problem ID and challenge date required' },
        { status: 400 }
      );
    }

    // Check if challenge already exists for this date
    const existingChallenge = await db
      .select()
      .from(DailyChallenge)
      .where(eq(DailyChallenge.challengeDate, challengeDate));

    if (existingChallenge.length > 0) {
      return NextResponse.json(
        { error: 'Challenge already exists for this date' },
        { status: 400 }
      );
    }

    const date = new Date(challengeDate);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const day = String(date.getDate());

    const challenge = await db
      .insert(DailyChallenge)
      .values({
        problemId,
        challengeDate,
        month,
        day,
      })
      .returning();

    return NextResponse.json({ challenge: challenge[0] });
  } catch (error) {
    console.error('Error creating daily challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('id');

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID required' },
        { status: 400 }
      );
    }

    await db.delete(DailyChallenge).where(eq(DailyChallenge.id, challengeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily challenge:', error);
    return NextResponse.json(
      { error: 'Failed to delete challenge' },
      { status: 500 }
    );
  }
}
