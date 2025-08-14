import { NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { operations } = await request.json();

    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No operations provided' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent overload
    const MAX_BATCH_SIZE = 10;
    if (operations.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `Batch size cannot exceed ${MAX_BATCH_SIZE}`,
        },
        { status: 400 }
      );
    }

    const API_URL = process.env.JUDGE0_API_URL;
    // Process operations in parallel with rate limiting
    const processOperation = async (operation, index) => {
      try {
        await new Promise(resolve => setTimeout(resolve, index * 100));

        const {
          type,
          problemId,
          sourceCode,
          languageId,
          stdin,
          expectedOutputs,
        } = operation;

        // Create batch submission data
        const batchSubmissions = stdin.map((input, i) => ({
          source_code: sourceCode,
          language_id: languageId,
          stdin: input,
          expected_output: expectedOutputs[i],
          cpu_time_limit: 2,
          memory_limit: 128000,
        }));

        // Submit batch to Judge0
        const batchResponse = await fetch(
          `${API_URL}/submissions/batch?base64_encoded=false`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ submissions: batchSubmissions }),
          }
        );

        if (!batchResponse.ok) {
          throw new Error(`Judge0 batch error: ${batchResponse.statusText}`);
        }

        const batchTokens = await batchResponse.json();
        const tokens = batchTokens.map(item => item.token).join(',');

        // Get batch results
        const resultsResponse = await fetch(
          `${API_URL}/submissions/batch?tokens=${tokens}&base64_encoded=false&fields=token,stdout,stderr,status,time,memory`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!resultsResponse.ok) {
          throw new Error(
            `Judge0 results error: ${resultsResponse.statusText}`
          );
        }

        const submissions = await resultsResponse.json();

        const testResults = submissions.map((result, i) => ({
          input: stdin[i],
          expectedOutput: expectedOutputs[i],
          actualOutput: result.stdout || result.stderr || '',
          passed: result.status?.id === 3,
          status: result.status?.description || 'Unknown',
          runtime: result.time || '0.000',
          memory: result.memory || '0',
          statusId: result.status?.id,
        }));

        const allPassed = testResults.every(r => r.passed);
        const passedCount = testResults.filter(r => r.passed).length;

        let submissionRecord = null;
        if (type === 'submission') {
          const submissionResponse = await fetch(
            `${request.nextUrl.origin}/api/submissions/${problemId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Cookie: request.headers.get('Cookie') || '',
              },
              body: JSON.stringify({
                source_code: sourceCode,
                language_id: languageId,
                status: allPassed ? 'accepted' : 'wrong_answer',
                runtime: testResults[0]?.runtime || '0.000',
                memory: testResults[0]?.memory || '0',
                test_cases_passed: passedCount.toString(),
                total_test_cases: testResults.length.toString(),
              }),
            }
          );

          if (submissionResponse.ok) {
            const submissionData = await submissionResponse.json();
            submissionRecord = submissionData.data;
          }
        }

        return {
          id: operation.id,
          success: true,
          result: {
            type,
            allPassed,
            passedCount,
            totalTestCases: testResults.length,
            testResults,
            submissionRecord,
            status: allPassed ? 'accepted' : 'wrong_answer',
          },
        };
      } catch (error) {
        console.error(`Error processing operation ${operation.id}:`, error);
        return {
          id: operation.id,
          success: false,
          error: error.message,
          result: null,
        };
      }
    };

    const batchResults = await Promise.all(
      operations.map((op, i) => processOperation(op, i))
    );

    const successfulOps = batchResults.filter(r => r.success).length;
    const failedOps = batchResults.length - successfulOps;

    return NextResponse.json({
      success: true,
      data: batchResults,
      statistics: {
        total: operations.length,
        successful: successfulOps,
        failed: failedOps,
        types: {
          submissions: operations.filter(op => op.type === 'submission').length,
          runs: operations.filter(op => op.type === 'run').length,
        },
      },
    });
  } catch (error) {
    console.error('Batch execution error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
