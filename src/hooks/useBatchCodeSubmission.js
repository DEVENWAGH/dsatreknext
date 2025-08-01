import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useLanguageStore } from '@/store/languageStore';

const useBatchCodeSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [runResults, setRunResults] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [batchQueue, setBatchQueue] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const { getLanguageIdByDisplayName } = useLanguageStore();

  // Batch configuration
  const batchConfig = useRef({
    maxBatchSize: 5,
    batchDelay: 500,
    maxRetries: 3,
  });

  // Add operation to batch queue
  const addToBatch = useCallback(operation => {
    setBatchQueue(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...operation,
      },
    ]);
  }, []);

  // Individual submission (original logic)
  const submitCodeIndividual = useCallback(
    async ({ problem, selectedLanguage, sourceCode }) => {
      const stdin = problem.testCases.map(tc => tc.input);
      const expected_outputs = problem.testCases.map(tc => tc.output);
      const language_id = getLanguageIdByDisplayName(selectedLanguage);

      if (!language_id) {
        throw new Error(`Language ID not available for ${selectedLanguage}`);
      }

      const submissionData = {
        source_code: sourceCode,
        language_id: parseInt(language_id, 10),
        stdin,
        expected_outputs,
      };

      const response = await fetch(`/api/submissions/${problem.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Submission failed');
      }

      return responseData.data;
    },
    [getLanguageIdByDisplayName]
  );

  // Individual run (original logic)
  const runCodeIndividual = useCallback(
    async ({ problem, selectedLanguage, sourceCode }) => {
      const stdin = problem.testCases.map(tc => tc.input);
      const expected_outputs = problem.testCases.map(tc => tc.output);
      const language_id = getLanguageIdByDisplayName(selectedLanguage);

      if (!language_id) {
        throw new Error(`Language ID not available for ${selectedLanguage}`);
      }

      const executionData = {
        source_code: sourceCode,
        language_id: parseInt(language_id, 10),
        stdin,
        expected_outputs,
      };

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(executionData),
      });

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Execution failed');
      }

      return responseData.data;
    },
    [getLanguageIdByDisplayName]
  );

  // Process individual operation (fallback)
  const processIndividualOperation = useCallback(
    async operation => {
      const { type, problem, sourceCode, language } = operation;

      if (type === 'submission') {
        return await submitCodeIndividual({
          problem,
          selectedLanguage: language,
          sourceCode,
        });
      } else if (type === 'run') {
        return await runCodeIndividual({
          problem,
          selectedLanguage: language,
          sourceCode,
        });
      }

      throw new Error(`Unknown operation type: ${type}`);
    },
    [submitCodeIndividual, runCodeIndividual]
  );

  // Process individual batch operations
  const processBatchOperations = useCallback(
    async operations => {
      const results = [];

      // Create batch API call payload
      const batchPayload = operations.map(op => ({
        id: op.id,
        type: op.type,
        problemId: op.problem.id,
        sourceCode: op.sourceCode,
        languageId: getLanguageIdByDisplayName(op.language),
        stdin: op.problem.testCases.map(tc => tc.input),
        expectedOutputs: op.problem.testCases.map(tc => tc.output),
      }));

      try {
        // Call batch API endpoint
        const response = await fetch('/api/execute/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operations: batchPayload }),
        });

        const responseData = await response.json();

        if (responseData.success && responseData.data) {
          for (const opResult of responseData.data) {
            const operation = operations.find(op => op.id === opResult.id);
            if (operation) {
              results.push({
                id: opResult.id,
                type: operation.type,
                operation,
                result: opResult.result,
                success: opResult.success,
                error: opResult.error,
              });
            }
          }
        }
      } catch (error) {
        console.error('Batch API call failed:', error);
        // Fallback to individual processing
        for (const operation of operations) {
          try {
            const result = await processIndividualOperation(operation);
            results.push({
              id: operation.id,
              type: operation.type,
              operation,
              result,
              success: true,
            });
          } catch (opError) {
            results.push({
              id: operation.id,
              type: operation.type,
              operation,
              result: null,
              success: false,
              error: opError.message,
            });
          }
        }
      }

      return results;
    },
    [getLanguageIdByDisplayName, processIndividualOperation]
  );

  // Process batch queue
  const processBatch = useCallback(async () => {
    if (batchQueue.length === 0 || isBatchProcessing) return;

    setIsBatchProcessing(true);
    setIsLoading(true);

    try {
      // Group operations by type and problem
      const groupedOps = batchQueue.reduce((acc, op) => {
        const key = `${op.type}_${op.problem.id}_${op.language}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(op);
        return acc;
      }, {});

      const batchResults = [];

      // Process each group in batches
      for (const operations of Object.values(groupedOps)) {
        const batches = [];
        for (
          let i = 0;
          i < operations.length;
          i += batchConfig.current.maxBatchSize
        ) {
          batches.push(
            operations.slice(i, i + batchConfig.current.maxBatchSize)
          );
        }

        for (const batch of batches) {
          try {
            const batchResult = await processBatchOperations(batch);
            batchResults.push(...batchResult);

            // Delay between batches to avoid overwhelming the API
            if (batches.length > 1) {
              await new Promise(resolve =>
                setTimeout(resolve, batchConfig.current.batchDelay)
              );
            }
          } catch (error) {
            console.error('Batch processing error:', error);
            toast.error(`Batch processing failed: ${error.message}`);
          }
        }
      }

      setBatchResults(batchResults);
      setBatchQueue([]); // Clear processed queue

      // Set the most recent result as the current result
      if (batchResults.length > 0) {
        const lastResult = batchResults[batchResults.length - 1];
        if (lastResult.type === 'submission') {
          setSubmissionResult(lastResult.result);
        } else {
          setRunResults(lastResult.result);
        }
      }

      toast.success(`Processed ${batchResults.length} operations successfully`);
    } catch (error) {
      console.error('Batch processing failed:', error);
      toast.error('Batch processing failed');
    } finally {
      setIsBatchProcessing(false);
      setIsLoading(false);
    }
  }, [batchQueue, isBatchProcessing, processBatchOperations]);

  // Enhanced submit code function with batching
  const submitCode = useCallback(
    async ({ problem, selectedLanguage, sourceCode }) => {
      if (!problem?.testCases || problem.testCases.length === 0) {
        toast.warning('No test cases available for this problem.');
        return;
      }

      if (!problem?.id) {
        console.error('Problem ID not available.');
        toast.error('Problem information is missing.');
        return;
      }

      // Add to batch queue
      addToBatch({
        type: 'submission',
        problem,
        language: selectedLanguage,
        sourceCode,
      });

      toast.info('Added submission to batch queue');
    },
    [addToBatch]
  );

  // Enhanced run code function with batching
  const runCode = useCallback(
    async ({ problem, selectedLanguage, sourceCode }) => {
      if (!problem?.testCases || problem.testCases.length === 0) {
        toast.warning('No test cases available for this problem.');
        return;
      }

      // Add to batch queue
      addToBatch({
        type: 'run',
        problem,
        language: selectedLanguage,
        sourceCode,
      });

      toast.info('Added code run to batch queue');
    },
    [addToBatch]
  );

  // Execute batch immediately
  const executeBatch = useCallback(() => {
    if (batchQueue.length === 0) {
      toast.warning('No operations in batch queue');
      return;
    }

    processBatch();
  }, [processBatch, batchQueue.length]);

  // Clear batch queue
  const clearBatch = useCallback(() => {
    setBatchQueue([]);
    setBatchResults([]);
    toast.info('Batch queue cleared');
  }, []);

  // Clear all results
  const clearResults = useCallback(() => {
    setRunResults(null);
    setSubmissionResult(null);
    setBatchResults([]);
  }, []);

  // Get batch statistics
  const getBatchStats = useCallback(() => {
    return {
      queueLength: batchQueue.length,
      completedBatches: batchResults.length,
      isProcessing: isBatchProcessing,
      types: {
        submissions: batchQueue.filter(op => op.type === 'submission').length,
        runs: batchQueue.filter(op => op.type === 'run').length,
      },
    };
  }, [batchQueue, batchResults, isBatchProcessing]);

  // Update batch configuration
  const updateBatchConfig = useCallback(newConfig => {
    batchConfig.current = { ...batchConfig.current, ...newConfig };
  }, []);

  return {
    // State
    isLoading,
    runResults,
    submissionResult,
    batchQueue,
    batchResults,
    isBatchProcessing,

    // Actions
    submitCode,
    runCode,
    executeBatch,
    clearBatch,
    clearResults,
    setSubmissionResult,

    // Batch management
    addToBatch,
    processBatch,
    getBatchStats,
    updateBatchConfig,

    // Configuration
    batchConfig: batchConfig.current,
  };
};

export default useBatchCodeSubmission;
