import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { discussionAPI } from '@/api/api';

/**
 * Comprehensive Workspace Store
 * Manages all workspace-related state including:
 * - Problem submissions
 * - Discussions and comments
 * - Test results
 * - UI states for workspace components
 */
export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      // Problem-related state
      currentProblem: null,

      // Submissions state
      submissions: {},
      submissionsLoading: {},
      submissionsError: {},

      // Discussion state
      discussions: {},
      comments: {},
      discussionsLoading: {},
      commentsLoading: {},
      discussionsError: {},
      commentsError: {},
      commentsPagination: {},

      // Test results state
      testResults: {},
      testResultsLoading: {},

      // UI state for workspace tabs
      selectedTabs: {},
      showHints: {},
      selectedTestCases: {},

      // Hidden test cases state
      hiddenTestCases: {},

      // Actions for submissions
      fetchSubmissions: async problemId => {
        if (!problemId) return;

        set(state => ({
          submissionsLoading: {
            ...state.submissionsLoading,
            [problemId]: true,
          },
          submissionsError: { ...state.submissionsError, [problemId]: null },
        }));

        try {
          const response = await fetch(
            `/api/problems/${problemId}/submissions`
          );
          const data = await response.json();

          if (data.success && Array.isArray(data.data)) {
            const sortedSubmissions = data.data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            set(state => ({
              submissions: {
                ...state.submissions,
                [problemId]: sortedSubmissions,
              },
              submissionsLoading: {
                ...state.submissionsLoading,
                [problemId]: false,
              },
            }));

            return sortedSubmissions;
          } else {
            set(state => ({
              submissions: { ...state.submissions, [problemId]: [] },
              submissionsLoading: {
                ...state.submissionsLoading,
                [problemId]: false,
              },
            }));
            return [];
          }
        } catch (error) {
          console.error('Error fetching submissions:', error);
          set(state => ({
            submissionsError: {
              ...state.submissionsError,
              [problemId]: 'Failed to load submissions.',
            },
            submissionsLoading: {
              ...state.submissionsLoading,
              [problemId]: false,
            },
            submissions: { ...state.submissions, [problemId]: [] },
          }));
          return [];
        }
      },

      // Actions for discussions
      fetchDiscussion: async problemId => {
        if (!problemId) return;

        set(state => ({
          discussionsLoading: {
            ...state.discussionsLoading,
            [problemId]: true,
          },
          discussionsError: { ...state.discussionsError, [problemId]: null },
        }));

        try {
          const response =
            await discussionAPI.getDiscussionByProblemId(problemId);

          set(state => ({
            discussions: {
              ...state.discussions,
              [problemId]: response.data.data,
            },
            discussionsLoading: {
              ...state.discussionsLoading,
              [problemId]: false,
            },
          }));

          return response.data.data;
        } catch (error) {
          console.error('Error fetching discussion:', error);
          set(state => ({
            discussionsError: {
              ...state.discussionsError,
              [problemId]: 'Failed to load discussion.',
            },
            discussionsLoading: {
              ...state.discussionsLoading,
              [problemId]: false,
            },
          }));
          return null;
        }
      },

      fetchComments: async (discussionId, page = 1, limit = 10) => {
        if (!discussionId) return;

        const cacheKey = `${discussionId}_${page}`;

        set(state => ({
          commentsLoading: { ...state.commentsLoading, [cacheKey]: true },
          commentsError: { ...state.commentsError, [cacheKey]: null },
        }));

        try {
          const response = await discussionAPI.getCommentsByDiscussionId(
            discussionId,
            page,
            limit
          );

          const commentsData = response.data.data.comments || [];
          const pagination = {
            currentPage: page,
            totalPages: response.data.data.totalPages || 0,
            total: response.data.data.total || 0,
          };

          set(state => ({
            comments: { ...state.comments, [cacheKey]: commentsData },
            commentsPagination: {
              ...state.commentsPagination,
              [discussionId]: pagination,
            },
            commentsLoading: { ...state.commentsLoading, [cacheKey]: false },
          }));

          return { comments: commentsData, pagination };
        } catch (error) {
          console.error('Error fetching comments:', error);
          set(state => ({
            commentsError: {
              ...state.commentsError,
              [cacheKey]: 'Failed to load comments.',
            },
            commentsLoading: { ...state.commentsLoading, [cacheKey]: false },
          }));
          return {
            comments: [],
            pagination: { currentPage: page, totalPages: 0, total: 0 },
          };
        }
      },

      // UI state actions
      setSelectedTab: (problemId, tab) => {
        set(state => ({
          selectedTabs: { ...state.selectedTabs, [problemId]: tab },
        }));
      },

      setShowHints: (problemId, show) => {
        set(state => ({
          showHints: { ...state.showHints, [problemId]: show },
        }));
      },

      setSelectedTestCase: (problemId, index) => {
        set(state => ({
          selectedTestCases: { ...state.selectedTestCases, [problemId]: index },
        }));
      },

      // Test results actions
      setTestResults: (problemId, results) => {
        set(state => ({
          testResults: { ...state.testResults, [problemId]: results },
        }));
      },

      setTestResultsLoading: (problemId, loading) => {
        set(state => ({
          testResultsLoading: {
            ...state.testResultsLoading,
            [problemId]: loading,
          },
        }));
      },

      // Hidden test cases actions
      setHiddenTestCases: (problemId, hiddenCases) => {
        set(state => ({
          hiddenTestCases: {
            ...state.hiddenTestCases,
            [problemId]: hiddenCases,
          },
        }));
      },

      // Set current problem
      setCurrentProblem: problem => {
        set({ currentProblem: problem });
      },

      // Get helpers (selectors)
      getSubmissions: problemId => get().submissions[problemId] || [],
      isSubmissionsLoading: problemId =>
        get().submissionsLoading[problemId] || false,
      getSubmissionsError: problemId =>
        get().submissionsError[problemId] || null,

      getDiscussion: problemId => get().discussions[problemId] || null,
      isDiscussionLoading: problemId =>
        get().discussionsLoading[problemId] || false,
      getDiscussionError: problemId =>
        get().discussionsError[problemId] || null,

      getComments: (discussionId, page = 1) => {
        const cacheKey = `${discussionId}_${page}`;
        return get().comments[cacheKey] || [];
      },
      isCommentsLoading: (discussionId, page = 1) => {
        const cacheKey = `${discussionId}_${page}`;
        return get().commentsLoading[cacheKey] || false;
      },
      getCommentsError: (discussionId, page = 1) => {
        const cacheKey = `${discussionId}_${page}`;
        return get().commentsError[cacheKey] || null;
      },
      getCommentsPagination: discussionId =>
        get().commentsPagination[discussionId] || {
          currentPage: 1,
          totalPages: 0,
          total: 0,
        },

      getSelectedTab: problemId =>
        get().selectedTabs[problemId] || 'description',
      getShowHints: problemId => get().showHints[problemId] || false,
      getSelectedTestCase: problemId => get().selectedTestCases[problemId] || 0,

      getTestResults: problemId => get().testResults[problemId] || null,
      isTestResultsLoading: problemId =>
        get().testResultsLoading[problemId] || false,

      getHiddenTestCases: problemId => get().hiddenTestCases[problemId] || [],

      // Clear cache actions
      clearSubmissionsCache: problemId => {
        if (problemId) {
          set(state => {
            const newSubmissions = { ...state.submissions };
            const newLoading = { ...state.submissionsLoading };
            const newError = { ...state.submissionsError };

            delete newSubmissions[problemId];
            delete newLoading[problemId];
            delete newError[problemId];

            return {
              submissions: newSubmissions,
              submissionsLoading: newLoading,
              submissionsError: newError,
            };
          });
        } else {
          set({
            submissions: {},
            submissionsLoading: {},
            submissionsError: {},
          });
        }
      },

      clearDiscussionCache: problemId => {
        if (problemId) {
          set(state => {
            const newDiscussions = { ...state.discussions };
            const newComments = { ...state.comments };
            const newDiscussionsLoading = { ...state.discussionsLoading };
            const newCommentsLoading = { ...state.commentsLoading };
            const newDiscussionsError = { ...state.discussionsError };
            const newCommentsError = { ...state.commentsError };
            const newCommentsPagination = { ...state.commentsPagination };

            delete newDiscussions[problemId];
            delete newDiscussionsLoading[problemId];
            delete newDiscussionsError[problemId];
            delete newCommentsPagination[problemId];

            // Clear related comments
            Object.keys(newComments).forEach(key => {
              if (key.startsWith(`${problemId}_`)) {
                delete newComments[key];
                delete newCommentsLoading[key];
                delete newCommentsError[key];
              }
            });

            return {
              discussions: newDiscussions,
              comments: newComments,
              discussionsLoading: newDiscussionsLoading,
              commentsLoading: newCommentsLoading,
              discussionsError: newDiscussionsError,
              commentsError: newCommentsError,
              commentsPagination: newCommentsPagination,
            };
          });
        } else {
          set({
            discussions: {},
            comments: {},
            discussionsLoading: {},
            commentsLoading: {},
            discussionsError: {},
            commentsError: {},
            commentsPagination: {},
          });
        }
      },

      // Clear all workspace data
      clearWorkspaceCache: () => {
        set({
          currentProblem: null,
          submissions: {},
          submissionsLoading: {},
          submissionsError: {},
          discussions: {},
          comments: {},
          discussionsLoading: {},
          commentsLoading: {},
          discussionsError: {},
          commentsError: {},
          commentsPagination: {},
          testResults: {},
          testResultsLoading: {},
          selectedTabs: {},
          showHints: {},
          selectedTestCases: {},
          hiddenTestCases: {},
        });
      },
    }),
    {
      name: 'workspace-storage',
      partialize: state => ({
        submissions: state.submissions,
        discussions: state.discussions,
        comments: state.comments,
        commentsPagination: state.commentsPagination,
        selectedTabs: state.selectedTabs,
        showHints: state.showHints,
        selectedTestCases: state.selectedTestCases,
      }),
    }
  )
);
