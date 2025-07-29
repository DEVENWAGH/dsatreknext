import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { discussionAPI } from '@/api/api';
import { toast } from 'sonner';

export const useDiscussionStore = create(
  persist(
    (set, get) => ({
      // State
      discussions: {},
      comments: {},
      isLoading: false,
      isLoadingComments: false,
      error: null,
      currentPage: 1,
      totalPages: 0,
      commentsPerPage: 10,

      // Get discussion by problem ID
      getDiscussionByProblemId: async problemId => {
        set({ isLoading: true, error: null });
        try {
          const response =
            await discussionAPI.getDisscussionByProblemId(problemId);
          const discussion = response.data.data;

          set(state => ({
            discussions: {
              ...state.discussions,
              [problemId]: discussion,
            },
            isLoading: false,
          }));

          return discussion;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          console.error('Error fetching discussion:', error);
          return null;
        }
      },

      // Get comments for discussion
      getCommentsByDiscussionId: async (discussionId, page = 1, limit = 10) => {
        set({ isLoadingComments: true, error: null });
        try {
          const response = await discussionAPI.getAllCommentByDiscussionId(
            discussionId,
            page,
            limit
          );
          const { comments: newComments, totalPages } = response.data.data;

          set(state => ({
            comments: {
              ...state.comments,
              [discussionId]:
                page === 1
                  ? newComments
                  : [...(state.comments[discussionId] || []), ...newComments],
            },
            currentPage: page,
            totalPages,
            isLoadingComments: false,
          }));

          return { comments: newComments, totalPages };
        } catch (error) {
          set({ error: error.message, isLoadingComments: false });
          console.error('Error fetching comments:', error);
          return { comments: [], totalPages: 0 };
        }
      },

      // Add comment
      addComment: async commentData => {
        try {
          const response = await discussionAPI.addComment(commentData);
          const newComment = response.data.data;

          set(state => ({
            comments: {
              ...state.comments,
              [commentData.discussionId]: [
                ...(state.comments[commentData.discussionId] || []),
                newComment,
              ],
            },
          }));

          toast.success('Comment added successfully');
          return newComment;
        } catch (error) {
          toast.error('Failed to add comment');
          console.error('Error adding comment:', error);
          throw error;
        }
      },

      // Update comment
      updateComment: async (commentId, content) => {
        try {
          const response = await discussionAPI.editComment(commentId, {
            content,
          });
          const updatedComment = response.data.data;

          set(state => {
            const newComments = { ...state.comments };
            Object.keys(newComments).forEach(discussionId => {
              newComments[discussionId] = newComments[discussionId].map(
                comment =>
                  comment.id === commentId ? { ...comment, content } : comment
              );
            });
            return { comments: newComments };
          });

          toast.success('Comment updated successfully');
          return updatedComment;
        } catch (error) {
          toast.error('Failed to update comment');
          console.error('Error updating comment:', error);
          throw error;
        }
      },

      // Delete comment
      deleteComment: async commentId => {
        try {
          await discussionAPI.removeComment(commentId);

          set(state => {
            const newComments = { ...state.comments };
            Object.keys(newComments).forEach(discussionId => {
              newComments[discussionId] = newComments[discussionId].filter(
                comment => comment.id !== commentId
              );
            });
            return { comments: newComments };
          });

          toast.success('Comment deleted successfully');
        } catch (error) {
          toast.error('Failed to delete comment');
          console.error('Error deleting comment:', error);
          throw error;
        }
      },

      // Get cached discussion
      getDiscussionFromCache: problemId => {
        return get().discussions[problemId] || null;
      },

      // Get cached comments
      getCommentsFromCache: discussionId => {
        return get().comments[discussionId] || [];
      },

      // Clear discussion data
      clearDiscussionData: () => {
        set({ discussions: {}, comments: {} });
      },
    }),
    {
      name: 'discussion-storage',
      partialize: state => ({
        discussions: state.discussions,
        comments: state.comments,
      }),
    }
  )
);
