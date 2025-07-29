import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Use POST method to execute code' },
    { status: 405 }
  );
}

export async function POST(request) {
  try {
    // Import auth dynamically to avoid build issues
    const { auth } = await import('@/auth');
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { source_code, language_id, stdin } = body;

    // Validate input
    if (!source_code || !language_id) {
      return NextResponse.json(
        { success: false, message: 'Source code and language ID are required' },
        { status: 400 }
      );
    }

    // For multiple test cases, we need to run them individually
    const testInputs = Array.isArray(stdin) ? stdin : [stdin || ''];
    const submissions = [];

    for (const input of testInputs) {
      const judge0Response = await fetch(
        `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
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
            'Code execution failed. Please check your code and try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tokens: submissions.map(s => s.token),
      testInputs: testInputs.length,
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
