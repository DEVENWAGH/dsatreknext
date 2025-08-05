import { useState } from 'react';
import { executeAPI } from '@/api/api';
import { toast } from 'sonner';
import { useLanguageStore } from '@/store/languageStore';
import { prepareCodeForJudge } from '@/utils/codeProcessor';
import { fireConfettiFireworks } from '@/components/magicui/confetti';

const useCodeSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [voiceDebugLogs, setVoiceDebugLogs] = useState([]); // New: voice debug logs
  const { getLanguageIdByDisplayName } = useLanguageStore();

  // Add voice debug logging
  const addVoiceDebugLog = (message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data,
      source: 'code-submission',
    };
    setVoiceDebugLogs(prev => [...prev.slice(-29), logEntry]); // Keep last 30 logs
    console.log(`🔊 [Code] ${message}`, data || '');
  };

  const submitCode = async ({ problem, selectedLanguage, sourceCode }) => {
    addVoiceDebugLog('Starting code submission', {
      problem: problem?.title,
      language: selectedLanguage,
    });

    if (!problem?.testCases || problem.testCases.length === 0) {
      toast.warning('No test cases available for this problem.');
      addVoiceDebugLog('No test cases available');
      setSubmissionResult(null);
      setRunResults(null);
      return;
    }

    if (!problem?.id) {
      toast.error('Problem information is missing.');
      addVoiceDebugLog('Problem ID missing');
      return;
    }

    setIsLoading(true);
    setIsSubmitting(true);
    setRunResults(null);
    setSubmissionResult(null);

    const stdin = problem.testCases.map(tc => tc.input);
    const expected_outputs = problem.testCases.map(tc => tc.output);

    const language_id = getLanguageIdByDisplayName(selectedLanguage);

    if (!language_id) {
      toast.error(`Language ID is not configured for ${selectedLanguage}.`);
      addVoiceDebugLog('Language ID not found', selectedLanguage);
      setIsLoading(false);
      return;
    }

    // Merge user code with top and bottom code for Judge0
    const finalCode = prepareCodeForJudge(
      problem,
      sourceCode,
      selectedLanguage
    );

    const submissionData = {
      source_code: finalCode,
      language_id: parseInt(language_id, 10),
      stdin,
      expected_outputs,
    };

    addVoiceDebugLog('Submitting to Judge0', {
      language_id,
      testCasesCount: stdin.length,
    });

    try {
      const response = await fetch(`/api/submissions/${problem.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      const responseData = await response.json();

      if (
        responseData.success &&
        responseData.data.tokens &&
        responseData.data.tokens.length > 0
      ) {
        addVoiceDebugLog('Submission tokens received', {
          tokensCount: responseData.data.tokens.length,
        });

        // Poll for submission results like run code
        const pollSubmissionResults = async tokens => {
          const maxAttempts = 10;
          const results = [];

          for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            let attempts = 0;

            while (attempts < maxAttempts) {
              try {
                const resultResponse = await fetch(`/api/execute/${token}`);
                const result = await resultResponse.json();

                if (result.status?.id <= 2) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  attempts++;
                  continue;
                }

                addVoiceDebugLog(`Test case ${i + 1} result`, {
                  status: result.status?.id,
                });

                // Handle Judge0 internal errors (status 13) - treat as server issue
                if (result.status?.id === 13) {
                  results.push({
                    input: stdin?.[i] || '',
                    expectedOutput: expected_outputs?.[i] || '',
                    actualOutput:
                      'Judge0 server configuration error - please contact admin',
                    passed: false,
                    status: 'server_error',
                    runtime: '0.000',
                    memory: '0',
                  });
                  break;
                }

                // Handle compilation errors (status 6)
                if (result.status?.id === 6) {
                  results.push({
                    input: stdin?.[i] || '',
                    expectedOutput: expected_outputs?.[i] || '',
                    actualOutput:
                      result.compile_output ||
                      result.stderr ||
                      'Compilation Error - Check your code syntax',
                    passed: false,
                    status: 'compile_error',
                    runtime: '0.000',
                    memory: '0',
                  });
                  break;
                }

                const actualOut = (result.stdout || '').trim();
                const expectedOut = (expected_outputs?.[i] || '').trim();

                // Normalize output for comparison - remove extra whitespace and common formatting
                const normalizeOutput = str => {
                  return str
                    .replace(/\\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/[[\\]\"']/g, '') // Remove brackets and quotes
                    .trim()
                    .toLowerCase();
                };

                const isMatch =
                  normalizeOutput(actualOut) === normalizeOutput(expectedOut);

                // If stderr exists, it's likely an error
                const hasError =
                  result.stderr && result.stderr.trim().length > 0;

                results.push({
                  input: stdin?.[i] || '',
                  expectedOutput: expectedOut,
                  actualOutput: hasError ? result.stderr.trim() : actualOut,
                  passed: isMatch && !hasError,
                  status: hasError
                    ? 'runtime_error'
                    : isMatch
                      ? 'accepted'
                      : 'wrong_answer',
                  runtime: result.time || '0.000',
                  memory: result.memory || '0',
                });
                break;
              } catch (pollError) {
                break;
              }
            }
          }

          const allPassed = results.every(r => r.passed);
          const passedCount = results.filter(r => r.passed).length;
          const latestSubmission = responseData.data.submissions[0];

          const finalStatus = allPassed ? 'accepted' : 'wrong_answer';
          const apiResults = results.map(r => ({
            status: { id: r.passed ? 3 : 4 },
            stdout: r.actualOutput,
            time: r.runtime,
            memory: r.memory,
          }));

          addVoiceDebugLog('Submission completed', {
            status: finalStatus,
            passedCount,
            totalCount: results.length,
          });

          const updateResponse = await fetch(
            `/api/submissions/update/${latestSubmission.id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                results: apiResults,
                expectedOutputs: results.map(r => r.expectedOutput),
              }),
            }
          );

          if (updateResponse.ok) {
            // Refresh user stats if submission was accepted
            if (finalStatus === 'accepted') {
              // Trigger stats refresh by dispatching a custom event
              window.dispatchEvent(new CustomEvent('statsUpdate'));
            }
          }

          setSubmissionResult({
            ...latestSubmission,
            status: finalStatus,
            testCaseResult: results,
          });

          setRunResults({
            allPassed,
            detailedResults: results,
          });

          if (allPassed) {
            toast.success('Accepted! All test cases passed.');
            addVoiceDebugLog('All test cases passed! 🎉');
            fireConfettiFireworks();
          } else {
            toast.error(
              `Wrong Answer - ${passedCount}/${results.length} test cases passed`
            );
            addVoiceDebugLog('Some test cases failed', {
              passedCount,
              totalCount: results.length,
            });
          }

          // Stop submit animation after results are processed
          setTimeout(() => {
            setIsSubmitting(false);
          }, 300);
        };

        pollSubmissionResults(responseData.data.tokens);
      } else {
        setSubmissionResult(null);
        setRunResults(null);
        toast.error(responseData.message || 'Code submission failed.');
        addVoiceDebugLog('Submission failed', responseData.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error('An error occurred during code submission.');
      addVoiceDebugLog('Submission error', error.message);
      setSubmissionResult(null);
      setRunResults(null);
      setIsSubmitting(false);
    } finally {
      setIsLoading(false);
    }
  };

  const runCode = async ({ problem, selectedLanguage, sourceCode }) => {
    if (!problem?.testCases || problem.testCases.length === 0) {
      toast.warning('No test cases available for this problem.');
      setRunResults(null);
      return;
    }

    setIsLoading(true);
    setIsRunning(true);
    setRunResults(null);
    setSubmissionResult(null);

    const stdin = problem.testCases.map(tc => tc.input);
    const expected_outputs = problem.testCases.map(tc => tc.output);

    const language_id = getLanguageIdByDisplayName(selectedLanguage);

    if (!language_id) {
      toast.error(`Language ID is not configured for ${selectedLanguage}.`);
      setIsLoading(false);
      return;
    }

    // Merge user code with top and bottom code for Judge0
    const finalCode = prepareCodeForJudge(
      problem,
      sourceCode,
      selectedLanguage
    );

    const executionData = {
      source_code: finalCode,
      language_id: parseInt(language_id, 10),
      stdin,
      expected_outputs,
    };

    try {
      const response = await executeAPI.executeCode(executionData);

      // Handle multiple tokens from individual test case executions
      if (response.tokens && Array.isArray(response.tokens)) {
        const pollAllResults = async tokens => {
          const maxAttempts = 15;
          const results = [];

          for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            let attempts = 0;

            while (attempts < maxAttempts) {
              try {
                const resultResponse = await fetch(`/api/execute/${token}`);
                const result = await resultResponse.json();

                if (result.status?.id <= 2) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  attempts++;
                  continue;
                }

                // Handle Judge0 internal errors (status 13)
                if (result.status?.id === 13) {
                  results.push({
                    testCaseIndex: i,
                    input: stdin[i] || '',
                    expectedOutput: expected_outputs[i] || '',
                    actualOutput: 'Judge0 server configuration error',
                    passed: false,
                    status: 'server_error',
                    runtime: '0.000',
                    memory: '0',
                    stderr: result.message || '',
                    compile_output: '',
                  });
                  break;
                }

                // Handle compilation errors (status 6)
                if (result.status?.id === 6) {
                  results.push({
                    testCaseIndex: i,
                    input: stdin[i] || '',
                    expectedOutput: expected_outputs[i] || '',
                    actualOutput:
                      result.compile_output ||
                      result.stderr ||
                      'Compilation Error',
                    passed: false,
                    status: 'compile_error',
                    runtime: '0.000',
                    memory: '0',
                    stderr: result.stderr || '',
                    compile_output: result.compile_output || '',
                  });
                  break;
                }

                const actualOut = (result.stdout || '').trim();
                const expectedOut = (expected_outputs[i] || '').trim();
                const hasError =
                  result.stderr && result.stderr.trim().length > 0;

                // Normalize output for comparison
                const normalizeOutput = str => {
                  return str
                    .replace(/\\s+/g, ' ')
                    .replace(/[[\\]\"']/g, '')
                    .trim()
                    .toLowerCase();
                };

                const isMatch =
                  normalizeOutput(actualOut) === normalizeOutput(expectedOut);

                results.push({
                  testCaseIndex: i,
                  input: stdin[i] || '',
                  expectedOutput: expectedOut,
                  actualOutput: hasError ? result.stderr.trim() : actualOut,
                  passed: isMatch && !hasError,
                  status: hasError
                    ? 'runtime_error'
                    : result.status?.id === 3
                      ? 'accepted'
                      : 'wrong_answer',
                  runtime: result.time || '0.000',
                  memory: result.memory || '0',
                  stderr: result.stderr || '',
                  compile_output: result.compile_output || '',
                });
                break;
              } catch (pollError) {
                attempts++;
                if (attempts >= maxAttempts) {
                  results.push({
                    testCaseIndex: i,
                    input: stdin[i] || '',
                    expectedOutput: expected_outputs[i] || '',
                    actualOutput: 'Execution timeout',
                    passed: false,
                    status: 'timeout',
                    runtime: '0.000',
                    memory: '0',
                    stderr: 'Execution timeout',
                    compile_output: '',
                  });
                }
              }
            }
          }

          return results;
        };

        const allResults = await pollAllResults(response.tokens);

        // Check for compilation errors
        const hasCompileError = allResults.some(r => r.compile_output);
        if (hasCompileError) {
          const compileError =
            allResults.find(r => r.compile_output)?.compile_output ||
            'Compilation error';
          setRunResults({
            allPassed: false,
            detailedResults: stdin.map((input, index) => ({
              input: input || '',
              expectedOutput: expected_outputs[index] || '',
              actualOutput: compileError,
              passed: false,
              status: 'compile_error',
              runtime: '0.000',
              memory: '0',
            })),
            executionSummary: {
              status: 'compile_error',
              runtime: '0.000 s',
              memory: '0 KB',
            },
          });
          toast.error('Code compilation error');
          return;
        }

        const passedCount = allResults.filter(r => r.passed).length;
        const allPassed = passedCount === allResults.length;

        setRunResults({
          allPassed,
          detailedResults: allResults.map(r => ({
            input: r.input,
            expectedOutput: r.expectedOutput,
            actualOutput: r.actualOutput,
            passed: r.passed,
            status: r.status,
            runtime: r.runtime,
            memory: r.memory,
          })),
          executionSummary: {
            status: allPassed ? 'accepted' : 'wrong_answer',
            runtime: `${Math.max(
              ...allResults.map(r => parseFloat(r.runtime) || 0)
            )} s`,
            memory: `${Math.max(
              ...allResults.map(r => parseInt(r.memory) || 0)
            )} KB`,
          },
        });

        if (allPassed) {
          toast.success(
            `All test cases passed! (${passedCount}/${allResults.length})`
          );
        } else {
          toast.error(
            `Some test cases failed (${passedCount}/${allResults.length} passed)`
          );
        }

        return;
      } else if (response.message?.includes('quota')) {
        toast.error('Daily quota exceeded. Try again tomorrow.');
      } else {
        toast.error(response.message || 'Code execution failed.');
      }
    } catch (error) {
      toast.error('An error occurred during code execution.');
      setRunResults(null);
    } finally {
      setIsLoading(false);
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setRunResults(null);
    setSubmissionResult(null);
    addVoiceDebugLog('Results cleared');
  };

  const getVoiceDebugLogs = () => voiceDebugLogs;

  const clearVoiceDebugLogs = () => {
    setVoiceDebugLogs([]);
    addVoiceDebugLog('Voice debug logs cleared');
  };

  return {
    isLoading,
    isRunning,
    isSubmitting,
    runResults,
    submissionResult,
    submitCode,
    runCode,
    clearResults,
    setSubmissionResult,
    // New voice debugging methods
    voiceDebugLogs,
    getVoiceDebugLogs,
    clearVoiceDebugLogs,
  };
};

export default useCodeSubmission;
