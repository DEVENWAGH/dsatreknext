import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { executeAPI } from '@/api/api';
import { toast } from 'sonner';

export const useCodeExecutionStore = create(
  persist(
    (set, get) => ({
      // State
      code: '',
      selectedLanguage: 'JAVASCRIPT',
      isExecuting: false,
      isSubmitting: false,
      executionResults: null,
      submissionResults: null,
      testResults: [],
      error: null,

      // Execution history
      executionHistory: [],

      // Code templates by language
      codeTemplates: {},

      // Enhanced voice recognition states
      isListening: false,
      currentTranscript: '',
      interimTranscript: '',
      finalTranscript: '',
      voiceDebugLog: [],
      // New states for better user feedback
      isAudioActive: false,
      isSoundDetected: false,
      speechConfidence: 0,
      speechProcessingState: 'idle', // idle, listening, processing, responding
      liveTranscriptBuffer: '',

      // Execute code
      executeCode: async codeData => {
        set({ isExecuting: true, error: null, executionResults: null });
        try {
          const response = await executeAPI.executeCode(codeData);
          const results = response.data;

          // Add to execution history
          const historyEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            language: codeData.language,
            code: codeData.code,
            results: results,
            status: results.status || 'executed',
          };

          set(state => ({
            executionResults: results,
            executionHistory: [historyEntry, ...state.executionHistory].slice(
              0,
              50
            ), // Keep last 50
            isExecuting: false,
          }));

          return results;
        } catch (error) {
          set({ error: error.message, isExecuting: false });
          toast.error('Code execution failed');
          console.error('Error executing code:', error);
          throw error;
        }
      },

      // Submit solution
      submitSolution: async (problemId, submissionData) => {
        set({ isSubmitting: true, error: null, submissionResults: null });
        try {
          const response = await executeAPI.createSubmission(
            problemId,
            submissionData
          );
          const results = response.data;

          // Add to execution history
          const historyEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            language: submissionData.language,
            code: submissionData.code,
            results: results,
            status: 'submitted',
            problemId: problemId,
          };

          set(state => ({
            submissionResults: results,
            executionHistory: [historyEntry, ...state.executionHistory].slice(
              0,
              50
            ),
            isSubmitting: false,
          }));

          if (results.status === 'Accepted') {
            toast.success('Solution accepted!');
          } else {
            toast.error(`Submission failed: ${results.status}`);
          }

          return results;
        } catch (error) {
          set({ error: error.message, isSubmitting: false });
          toast.error('Submission failed');
          console.error('Error submitting solution:', error);
          throw error;
        }
      },

      // Set code
      setCode: code => set({ code }),

      // Set selected language
      setSelectedLanguage: language => set({ selectedLanguage: language }),

      // Set code template for language
      setCodeTemplate: (language, template) => {
        set(state => ({
          codeTemplates: {
            ...state.codeTemplates,
            [language]: template,
          },
        }));
      },

      // Get code template
      getCodeTemplate: language => {
        return get().codeTemplates[language] || '';
      },

      // Clear execution results
      clearExecutionResults: () => {
        set({
          executionResults: null,
          submissionResults: null,
          testResults: [],
          error: null,
        });
      },

      // Clear execution history
      clearExecutionHistory: () => {
        set({ executionHistory: [] });
      },

      // Get execution history for problem
      getExecutionHistoryForProblem: problemId => {
        return get().executionHistory.filter(
          entry => entry.problemId === problemId
        );
      },

      // Get recent executions
      getRecentExecutions: (limit = 10) => {
        return get().executionHistory.slice(0, limit);
      },

      // Remove execution from history
      removeFromHistory: entryId => {
        set(state => ({
          executionHistory: state.executionHistory.filter(
            entry => entry.id !== entryId
          ),
        }));
      },

      // Enhanced voice recognition methods
      setListening: listening => set({ isListening: listening }),
      setCurrentTranscript: transcript =>
        set({ currentTranscript: transcript }),
      setInterimTranscript: transcript =>
        set({ interimTranscript: transcript }),
      setFinalTranscript: transcript => set({ finalTranscript: transcript }),
      // New methods for enhanced voice feedback
      setAudioActive: active => set({ isAudioActive: active }),
      setSoundDetected: detected => set({ isSoundDetected: detected }),
      setSpeechConfidence: confidence => set({ speechConfidence: confidence }),
      setSpeechProcessingState: state => set({ speechProcessingState: state }),
      setLiveTranscriptBuffer: buffer => set({ liveTranscriptBuffer: buffer }),
      addVoiceDebugLog: entry =>
        set(state => ({
          voiceDebugLog: [...state.voiceDebugLog.slice(-50), entry], // Keep last 50 entries
        })),
      clearVoiceDebugLog: () => set({ voiceDebugLog: [] }),
    }),
    {
      name: 'code-execution-storage',
      partialize: state => ({
        codeTemplates: state.codeTemplates,
        executionHistory: state.executionHistory,
        selectedLanguage: state.selectedLanguage,
      }),
    }
  )
);
