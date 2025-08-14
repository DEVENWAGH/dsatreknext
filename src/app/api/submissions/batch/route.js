import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Submission } from '@/lib/schema';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { submissions } = await request.json();

    if (
      !submissions ||
      !Array.isArray(submissions) ||
      submissions.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: 'No submissions provided' },
        { status: 400 }
      );
    }

    // Limit batch size
    const MAX_BATCH_SIZE = 20;
    if (submissions.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `Batch size cannot exceed ${MAX_BATCH_SIZE}`,
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Process submissions in parallel
    const submissionPromises = submissions.map(
      async (submissionData, index) => {
        try {
          // Add delay for database rate limiting
          await new Promise(resolve => setTimeout(resolve, index * 50));

          const {
            problemId,
            sourceCode,
            language,
            status,
            runtime,
            memory,
            testCasesPassed,
            totalTestCases,
          } = submissionData;

          // Validate required fields
          if (!problemId || !sourceCode || !language) {
            throw new Error(
              'Missing required fields: problemId, sourceCode, language'
            );
          }

          // Insert submission into database
          const [newSubmission] = await db
            .insert(Submission)
            .values({
              userId,
              problemId,
              code: sourceCode,
              language,
              status: status || 'pending',
              runtime: runtime || null,
              memory: memory || null,
              testCasesPassed: testCasesPassed || '0',
              totalTestCases: totalTestCases || '0',
            })
            .returning();

          return {
            index,
            success: true,
            submission: newSubmission,
            error: null,
          };
        } catch (error) {
          console.error(`Error saving submission ${index}:`, error);
          return {
            index,
            success: false,
            submission: null,
            error: error.message,
          };
        }
      }
    );

    const batchResults = await Promise.all(submissionPromises);

    // Separate successful and failed submissions
    const successful = batchResults.filter(r => r.success);
    const failed = batchResults.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      data: {
        submissions: successful.map(r => r.submission),
        statistics: {
          total: submissions.length,
          successful: successful.length,
          failed: failed.length,
          errors: failed.map(f => ({ index: f.index, error: f.error })),
        },
      },
    });
  } catch (error) {
    console.error('Batch submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
