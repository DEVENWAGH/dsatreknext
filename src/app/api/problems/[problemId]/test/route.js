import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { problemId } = await params;
    const body = await request.json();
    const { code, language, testCases } = body;

    if (!code || !language) {
      return NextResponse.json(
        { success: false, message: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Call Judge0 API directly
    const testInputs = testCases?.map(tc => tc.input) || [''];
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
            source_code: code,
            language_id: language,
            stdin: input,
          }),
        }
      );

      const result = await judge0Response.json();
      if (judge0Response.ok) {
        submissions.push(result);
      }
    }

    const result = {
      success: true,
      tokens: submissions.map(s => s.token),
      testInputs: testInputs.length,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Test execution error:', error);
    return NextResponse.json(
      { success: false, message: 'Test execution failed' },
      { status: 500 }
    );
  }
}
