import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    // Import dependencies dynamically
    const { auth } = await import('@/auth');
    const { db } = await import('@/lib/db');
    const { Submission } = await import('@/lib/schema');

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { problemId } = await params;
    const body = await request.json();
    const { source_code, language_id, stdin } = body;

    // For multiple test cases, we need to run them individually
    const testInputs = Array.isArray(stdin) ? stdin : [stdin || ''];
    const submissions = [];

    for (const input of testInputs) {
      const judge0Response = await fetch(
        `${process.env.JUDGE0_API_URL}/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_code,
            language_id,
            stdin: input,
          }),
        }
      );

      const result = await judge0Response.json();

      if (judge0Response.ok) {
        submissions.push(result);
      }
    }

    if (submissions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Daily quota exceeded. Please try again tomorrow or upgrade your plan.',
        },
        { status: 429 }
      );
    }

    // Save submission to database
    const submission = await db
      .insert(Submission)
      .values({
        userId: session.user.id,
        problemId,
        code: source_code,
        language: language_id.toString(),
        status: 'pending',
        runtime: null,
        memory: null,
        testCasesPassed: '0',
        totalTestCases: submissions.length.toString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        submissions: [submission[0]],
        tokens: submissions.map(s => s.token),
      },
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
