import { NextResponse } from 'next/server';
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

    return NextResponse.json(
      {
        success: true,
        problem: problem[0],
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
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

    // Get current problem first
    const currentProblem = await db
      .select()
      .from(Problem)
      .where(eq(Problem.id, problemId))
      .limit(1);

    if (!currentProblem || currentProblem.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Problem not found' },
        { status: 404 }
      );
    }

    // Update the problem with merged data
    const updatedProblem = await db
      .update(Problem)
      .set({
        title: data.title ?? currentProblem[0].title,
        description: data.description ?? currentProblem[0].description,
        editorial: data.editorial ?? currentProblem[0].editorial,
        difficulty: data.difficulty ?? currentProblem[0].difficulty,
        tags: data.tags ?? currentProblem[0].tags,
        companies: data.companies ?? currentProblem[0].companies,
        starterCode: data.starterCode ?? currentProblem[0].starterCode,
        topCode: data.topCode ?? currentProblem[0].topCode,
        bottomCode: data.bottomCode ?? currentProblem[0].bottomCode,
        solution:
          data.referenceSolution ?? data.solution ?? currentProblem[0].solution,
        testCases: data.testCases ?? currentProblem[0].testCases,
        hints: data.hints ?? currentProblem[0].hints,
        isPremium: data.isPremium ?? currentProblem[0].isPremium,
        isActive: data.isActive ?? currentProblem[0].isActive,
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
