import React, { useState, useRef, useCallback, useEffect } from 'react';
import Split from 'react-split';
import ProblemDescriptionPanel from './ProblemDescriptionPanel';
import Playground from './Playground';
import BatchManager from './BatchManager';
import { toast } from 'sonner';
import useBatchCodeSubmission from '@/hooks/useBatchCodeSubmission';
import useCodeSubmission from '@/hooks/useCodeSubmission';
import useSubmissionStore from '@/store/submissionStore.js';

const Workspace = ({
  problem,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  editorSettings,
  setEditorSettings,
}) => {
  const [useBatchMode, setUseBatchMode] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);

  // Use both hooks - batch and regular
  const batchHook = useBatchCodeSubmission();
  const regularHook = useCodeSubmission();

  // Choose which hook to use based on batch mode
  const {
    isLoading,
    isRunning,
    isSubmitting,
    runResults,
    submissionResult,
    submitCode,
    runCode,
    clearResults,
    setSubmissionResult,
  } = useBatchMode ? batchHook : regularHook;

  const editorRef = useRef(null);

  // Modify handleRunCode to use the hook's runCode function
  const handleRunCode = async () => {
    if (!editorRef.current) {
      console.error('Editor not ready or ref not assigned.');
      toast.error('Code editor not ready. Please wait.');
      return;
    }
    const sourceCode = editorRef.current.getValue();
    runCode({ problem, selectedLanguage, sourceCode });
  };

  // Get markAsSubmitted function from submission store
  const markAsSubmitted = useSubmissionStore(state => state.markAsSubmitted);

  // Modify handleSubmitCode to use the hook's submitCode function and mark problem as submitted
  const handleSubmitCode = async () => {
    if (!editorRef.current) {
      console.error('Editor not ready or ref not assigned.');
      toast.error('Code editor not ready. Please wait.');
      return;
    }
    const sourceCode = editorRef.current.getValue();
    const result = await submitCode({ problem, selectedLanguage, sourceCode });

    // If submission is successful, mark the problem as submitted
    if (result && result.status === 'Accepted') {
      markAsSubmitted(problem.id);
    }
  };

  // Add a handler to clear submission results when the ProblemDescriptionPanel requests it
  const handleClearSubmissionResult = () => {
    clearResults();
  };

  // Handler for when a submission is selected from the ProblemSubmission list
  const handleSubmissionSelectedFromList = submission => {
    setSubmissionResult(submission); // Update the submissionResult state in Workspace
  };

  // Handler for maximizing/minimizing the editor
  const handleEditorMaximize = useCallback(maximized => {
    setIsEditorMaximized(maximized);
  }, []);

  // Workspace component will structure the main split view
  return (
    <div className="h-full">
      <Split
        sizes={isEditorMaximized ? [0, 100] : [50, 50]}
        minSize={isEditorMaximized ? [0, 100] : 300}
        expandToMin={false}
        gutterSize={isEditorMaximized ? 0 : 10}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor={isEditorMaximized ? 'default' : 'col-resize'}
        className="flex h-full"
        gutter={() => {
          const gutter = document.createElement('div');
          gutter.className =
            'relative flex items-center justify-center hover:cursor-col-resize group';

          // Create the visible resize handle with hover effect
          const handle = document.createElement('div');
          handle.className =
            'w-1 h-full bg-gray-300 group-hover:w-2 group-hover:bg-blue-500 transition-all duration-150 rounded-full';

          // Add a tooltip-like indicator that appears on hover
          const indicator = document.createElement('div');
          indicator.className =
            'absolute opacity-0 group-hover:opacity-100 bg-blue-500 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity duration-150 z-50';
          indicator.textContent = 'Resize';

          gutter.appendChild(handle);
          gutter.appendChild(indicator);

          return gutter;
        }}
      >
        {/* Left Panel: Problem Description */}
        <div
          className={`h-full overflow-hidden flex flex-col ${isEditorMaximized ? 'hidden' : ''}`}
        >
          {/* Pass submissionResult, the clear handler, and the submission select handler to ProblemDescriptionPanel */}
          <ProblemDescriptionPanel
            problem={problem}
            selectedLanguage={selectedLanguage}
            submissionResult={submissionResult}
            onClearSubmissionResult={handleClearSubmissionResult}
            onSubmissionSelected={handleSubmissionSelectedFromList}
            editorRef={editorRef}
          />

          {/* Batch Manager - only show in batch mode */}
          {useBatchMode && (
            <div className="p-4 border-t bg-gray-50">
              <BatchManager
                batchQueue={batchHook.batchQueue}
                batchResults={batchHook.batchResults}
                isBatchProcessing={batchHook.isBatchProcessing}
                isLoading={isLoading}
                executeBatch={batchHook.executeBatch}
                clearBatch={batchHook.clearBatch}
                getBatchStats={batchHook.getBatchStats}
                updateBatchConfig={batchHook.updateBatchConfig}
                batchConfig={batchHook.batchConfig}
              />
            </div>
          )}
        </div>

        {/* Right Panel: Playground (Code Editor and Test Cases) */}
        <div className="h-full overflow-hidden">
          <Playground
            problem={problem}
            selectedLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
            availableLanguages={availableLanguages}
            editorRef={editorRef}
            onRun={handleRunCode} // Pass modified run handler
            onSubmission={handleSubmitCode} // Pass modified submit handler
            runResults={runResults}
            isLoading={isLoading}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            useBatchMode={useBatchMode}
            onBatchModeChange={setUseBatchMode}
            onMaximize={handleEditorMaximize}
            editorSettings={editorSettings}
            setEditorSettings={setEditorSettings}
          />
        </div>
      </Split>
    </div>
  );
};

export default Workspace;
