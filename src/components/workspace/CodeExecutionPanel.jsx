'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import useCodeSubmission from '@/hooks/useCodeSubmission';
import { useWorkspaceStore } from '@/store/workspaceStore';

const CodeExecutionPanel = () => {
  const { isRunning, isSubmitting, runResults, submitCode, runCode } =
    useCodeSubmission();
  const { problem, selectedLanguage, sourceCode } = useWorkspaceStore();

  const handleRunCode = () => {
    runCode({ problem, selectedLanguage, sourceCode });
  };

  const handleSubmitCode = () => {
    submitCode({ problem, selectedLanguage, sourceCode });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={handleRunCode}
          disabled={isRunning || isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running...' : 'Run'}
        </Button>

        <Button
          onClick={handleSubmitCode}
          disabled={isRunning || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Square className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>

      {runResults && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">
            Results (
            {runResults.detailedResults?.filter(r => r.passed).length || 0}/
            {runResults.detailedResults?.length || 0} passed)
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {runResults.detailedResults?.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded text-xs ${result.passed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}
              >
                <div className="font-mono">
                  <div>
                    <strong>Input:</strong> {result.input || 'No input'}
                  </div>
                  <div>
                    <strong>Expected:</strong> {result.expectedOutput}
                  </div>
                  <div>
                    <strong>Output:</strong> {result.actualOutput}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {result.runtime}s | {result.memory}KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExecutionPanel;
