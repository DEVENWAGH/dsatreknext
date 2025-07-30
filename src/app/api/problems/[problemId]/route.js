import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Problem } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    // Allow public access to read problems
    const session = await auth();

    const { problemId } = await params;

    if (!problemId) {
      return NextResponse.json(
        { success: false, message: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // Get the problem
    const problem = await db
      .select()
      .from(Problem)
      .where(eq(Problem.id, problemId))
      .limit(1);

    if (!problem || problem.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Problem not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      problem: problem[0],
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { problemId } = await params;
    const data = await request.json();

    if (!problemId) {
      return NextResponse.json(
        { success: false, message: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // Update the problem
    const updatedProblem = await db
      .update(Problem)
      .set({
        title: data.title,
        description: data.description,
        editorial: data.editorial,
        difficulty: data.difficulty,
        tags: data.tags,
        companies: data.companies,
        starterCode: data.starterCode,
        topCode: data.topCode,
        bottomCode: data.bottomCode,
        solution: data.referenceSolution,
        testCases: data.testCases,
        hints: data.hints,
        isPremium: data.isPremium,
        updatedAt: new Date(),
      })
      .where(eq(Problem.id, problemId))
      .returning();

    if (!updatedProblem || updatedProblem.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Problem not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      problem: updatedProblem[0],
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
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

    // Delete the problem
    const deletedProblem = await db
      .delete(Problem)
      .where(eq(Problem.id, problemId))
      .returning();

    if (!deletedProblem || deletedProblem.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Problem not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Problem deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting problem:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
