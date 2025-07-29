import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MemoryStick } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import Image from 'next/image';
const ProblemSubmissionResult = ({ submissionResult, problem }) => {
  const { getLanguageDisplayName } = useLanguageStore();

  // Calculate values first
  const testResults = submissionResult?.testCaseResult || [];
  const totalCount = testResults.length;
  const passedCount = testResults.filter(
    r => r.actualOutput === r.expectedOutput
  ).length;
  const isAccepted =
    passedCount === testResults.length && testResults.length > 0;
  const actualStatus = isAccepted ? 'accepted' : 'wrong_answer';

  // Save submission status to localStorage when it changes
  useEffect(() => {
    if (problem?.id && submissionResult) {
      localStorage.setItem(
        `submission_${problem.id}`,
        JSON.stringify({
          isAccepted,
          passedCount,
          totalCount,
          timestamp: Date.now(),
        })
      );
    }
  }, [isAccepted, passedCount, totalCount, problem?.id, submissionResult]);

  if (!submissionResult) {
    return (
      <div className="p-4 text-center text-muted-foreground flex flex-col items-center">
        <Image
          src="/Null.png"
          alt="No submissions"
          width={160}
          height={160}
          style={{ width: 'auto', height: 'auto' }}
          className="mt-60 mb-2 max-w-[160px] max-h-[160px]"
        />
        No submissions yet. Submit your solution to see it here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center gap-3">
        {isAccepted ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <XCircle className="w-6 h-6 text-red-500" />
        )}
        <div>
          <h3 className="text-lg font-semibold">
            {isAccepted ? 'Accepted' : 'Wrong Answer'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {passedCount}/{totalCount} test cases passed
          </p>
        </div>
      </div>

      {/* Test Cases Results */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Test Cases</h4>
          {testResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Test Case {index + 1}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      result.actualOutput === result.expectedOutput
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {result.actualOutput === result.expectedOutput
                      ? 'Passed'
                      : 'Failed'}
                  </span>
                  {result.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{result.runtime}s</span>
                    </div>
                  )}
                  {result.memory && (
                    <div className="flex items-center gap-1">
                      <MemoryStick className="w-3 h-3" />
                      <span>{result.memory} KB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium mb-1">Input:</div>
                  <div className="bg-muted p-2 rounded font-mono">
                    {result.input || 'No input'}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Expected Output:</div>
                  <div className="bg-muted p-2 rounded font-mono">
                    {result.expectedOutput || 'No expected output'}
                  </div>
                </div>
                {result.actualOutput && (
                  <div className="md:col-span-2">
                    <div className="font-medium mb-1">Your Output:</div>
                    <div className="bg-muted p-2 rounded font-mono">
                      {result.actualOutput}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Details */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <span className={isAccepted ? 'text-green-500' : 'text-red-500'}>
            {actualStatus}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Language:</span>
          <span>
            {getLanguageDisplayName(submissionResult.language) ||
              submissionResult.language ||
              'Unknown'}
          </span>
        </div>
        {submissionResult.createdAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Submitted:</span>
            <span>{new Date(submissionResult.createdAt).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemSubmissionResult;
