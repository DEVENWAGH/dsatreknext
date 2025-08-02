import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Submission } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user) {
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

    // Get submissions for this problem by the current user
    const submissions = await db
      .select({
        id: Submission.id,
        problemId: Submission.problemId,
        code: Submission.code,
        language: Submission.language,
        status: Submission.status,
        runtime: Submission.runtime,
        memory: Submission.memory,
        testCasesPassed: Submission.testCasesPassed,
        totalTestCases: Submission.totalTestCases,
        createdAt: Submission.createdAt,
      })
      .from(Submission)
      .where(
        and(
          eq(Submission.problemId, problemId),
          eq(Submission.userId, session.user.id)
        )
      )
      .orderBy(desc(Submission.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Error fetching problem submissions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching submissions',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { problemId } = await params;
    const body = await request.json();
    const { code, language } = body;

    if (!code || !language) {
      return NextResponse.json(
        { success: false, message: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Get the problem to access test cases and template codes
    const { Problem } = await import('@/lib/schema');
    const { prepareCodeForJudge } = await import('@/utils/codeProcessor');
    const { useLanguageStore } = await import('@/store/languageStore');

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

    const testCases = problem[0].testCases || [];

    // Convert language ID to language key
    const languageData = useLanguageStore.getState().getLanguageById(language);
    const languageKey = languageData?.key || 'CPP';

    // Prepare final code with template merging
    const finalCode = prepareCodeForJudge(problem[0], code, languageKey);

    // Submit to Judge0 for all test cases
    const testInputs = testCases.map(tc => tc.input);
    const submissions = [];

    for (const input of testInputs) {
      const judge0Response = await fetch(
        `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_code: finalCode,
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

    // Evaluate results
    let passedTests = 0;
    let status = 'Wrong Answer';
    let runtime = null;
    let memory = null;

    for (let i = 0; i < submissions.length; i++) {
      const result = submissions[i];
      const expectedOutput = testCases[i]?.output || '';
      const actualOutput = result.stdout || '';

      if (actualOutput.trim() === expectedOutput.trim()) {
        passedTests++;
      }

      // Get runtime and memory from first successful execution
      if (!runtime && result.time) runtime = result.time;
      if (!memory && result.memory) memory = result.memory;
    }

    if (passedTests === testCases.length) {
      status = 'Accepted';
    }

    // Save submission to database
    const submissionData = {
      problemId,
      userId: session.user.id,
      code,
      language: language.toString(),
      status,
      runtime: runtime ? `${runtime}s` : null,
      memory: memory ? `${memory} KB` : null,
      testCasesPassed: passedTests,
      totalTestCases: testCases.length,
      createdAt: new Date(),
    };

    const savedSubmission = await db
      .insert(Submission)
      .values(submissionData)
      .returning();

    return NextResponse.json({
      success: true,
      data: savedSubmission[0],
      status,
      testCasesPassed: passedTests,
      totalTestCases: testCases.length,
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error submitting solution',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
