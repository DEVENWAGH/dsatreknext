import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { User, Problem, Submission } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const totalUsers = await db.select().from(User);
    const totalProblems = await db.select().from(Problem);
    const totalSubmissions = await db.select().from(Submission);
    const acceptedSubmissions = await db
      .select()
      .from(Submission)
      .where(eq(Submission.status, 'accepted'));

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers.length,
        totalProblems: totalProblems.length,
        totalSubmissions: totalSubmissions.length,
        acceptedSubmissions: acceptedSubmissions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch admin stats',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
