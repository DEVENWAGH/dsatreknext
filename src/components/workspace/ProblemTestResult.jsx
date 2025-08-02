import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceStore } from '@/store/workspaceStore';
import useCodeSubmission from '@/hooks/useCodeSubmission';

export const getStatusColor = status => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return 'bg-green-500/10 text-green-500';
    case 'wrong_answer':
    case 'time_limit_exceeded':
    case 'memory_limit_exceeded':
    case 'runtime_error':
    case 'compilation_error':
    case 'internal_error':
      return 'bg-red-500/10 text-red-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

const ProblemTestResult = ({
  runResults,
  problemTestCases,
  isLoading,
  problemId,
}) => {
  const { getSelectedTestCase, setSelectedTestCase } = useWorkspaceStore();
  const selectedCaseIndex = getSelectedTestCase(problemId);

  useEffect(() => {
    if (problemId) setSelectedTestCase(problemId, 0);
  }, [runResults, problemId, setSelectedTestCase]);

  const testCasesToDisplay =
    runResults?.detailedResults || problemTestCases || [];
  const selectedCase = testCasesToDisplay[selectedCaseIndex];
  const executionSummary = runResults?.executionSummary;

  if (isLoading && !runResults) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    );
  }

  if (testCasesToDisplay.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No test results available. Run your code to see results.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4">
        {/* Execution Summary */}
        {executionSummary && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                  testCasesToDisplay.every(tc => tc.passed)
                    ? 'accepted'
                    : 'wrong_answer'
                )}`}
              >
                {testCasesToDisplay.every(tc => tc.passed)
                  ? 'Accepted'
                  : 'Wrong Answer'}
              </span>
            </div>
            {executionSummary.runtime && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Runtime:</span>
                <span className="text-sm">{executionSummary.runtime}</span>
              </div>
            )}
            {executionSummary.memory && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Memory:</span>
                <span className="text-sm">{executionSummary.memory}</span>
              </div>
            )}
          </div>
        )}

        {/* Test Case Navigation */}
        <div className="flex items-center gap-2">
          <span className="font-semibold mr-2">Test Cases:</span>
          <div className="flex gap-2 flex-wrap">
            {testCasesToDisplay.map((testCase, index) => (
              <button
                key={index}
                onClick={() => setSelectedTestCase(problemId, index)}
                className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                  selectedCaseIndex === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Case {index + 1}
                {testCase.actualOutput && testCase.expectedOutput && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      testCase.actualOutput.trim() ===
                      testCase.expectedOutput.trim()
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Test Case Details */}
        {selectedCase && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Input:</h4>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {selectedCase.input}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Expected Output:</h4>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {selectedCase.expectedOutput || selectedCase.output}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Your Output:</h4>
              <div
                className={`bg-muted p-3 rounded-lg font-mono text-sm whitespace-pre-wrap ${
                  selectedCase.actualOutput?.trim() ===
                  selectedCase.expectedOutput?.trim()
                    ? 'border-l-4 border-green-500'
                    : 'border-l-4 border-red-500'
                }`}
              >
                {selectedCase.actualOutput || 'No output'}
              </div>
            </div>
          </div>
        )}

        {/* Show hidden test cases message if more than 3 */}
        {testCasesToDisplay.length > 3 && (
          <div className="text-sm text-muted-foreground text-center py-2 border-t">
            + {testCasesToDisplay.length - 3} hidden test cases
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemTestResult;
