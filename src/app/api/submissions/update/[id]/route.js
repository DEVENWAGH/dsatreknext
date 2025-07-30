import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  try {
    // Import dependencies dynamically
    const { auth } = await import('@/auth');
    const { db } = await import('@/lib/db');
    const { Submission } = await import('@/lib/schema');
    const { eq, and } = await import('drizzle-orm');

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { results, expectedOutputs } = body;

    // Evaluate test results
    let passedTests = 0;
    let totalTests = results?.length || 0;
    let finalStatus = 'wrong answer';
    let totalRuntime = 0;
    let totalMemory = 0;

    if (results && expectedOutputs) {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const expected = expectedOutputs[i];

        if (result.status?.id === 3) {
          // Accepted by Judge0
          const actualOutput = result.stdout?.trim() || '';
          const expectedOutput = expected?.trim() || '';

          // Normalize output for comparison
          const normalizeOutput = str => {
            return str
              .replace(/\s+/g, ' ')
              .replace(/[[\]"']/g, '')
              .trim()
              .toLowerCase();
          };

          if (
            normalizeOutput(actualOutput) === normalizeOutput(expectedOutput)
          ) {
            passedTests++;
          }
        }

        totalRuntime += parseFloat(result.time) || 0;
        totalMemory += parseInt(result.memory) || 0;
      }

      if (passedTests === totalTests && totalTests > 0) {
        finalStatus = 'accepted';
      }
    }

    const updatedSubmission = await db
      .update(Submission)
      .set({
        status: finalStatus,
        testCasesPassed: passedTests.toString(),
        totalTestCases: totalTests.toString(),
        runtime: totalRuntime.toFixed(3),
        memory: Math.round(totalMemory / totalTests).toString(),
      })
      .where(and(eq(Submission.id, id), eq(Submission.userId, session.user.id)))
      .returning();

    if (updatedSubmission.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSubmission[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
