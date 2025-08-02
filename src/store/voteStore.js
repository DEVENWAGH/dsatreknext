import { create } from 'zustand';

// Create a store for vote state management
const useVoteStore = create(set => ({
  // Store votes by postId
  votes: {},

  // Store user votes by postId
  userVotes: {},

  // Store loading state by postId
  loadingVotes: {},

  // Initialize store with posts data
  initializeVotes: posts => {
    const votes = {};
    const userVotes = {};

    posts.forEach(post => {
      votes[post.id] = post.votes || 0;
      userVotes[post.id] = post.userVote || null;
    });

    console.log('VoteStore initialized with:', { votes, userVotes });
    set({ votes, userVotes });
  },

  // Vote on a post (optimistic update)
  voteOnPost: (postId, voteType) => {
    set(state => {
      // Get current vote state
      const currentVotes = state.votes[postId] || 0;
      const currentUserVote = state.userVotes[postId] || null;

      // Calculate new vote count
      let newVoteCount = currentVotes;
      let newUserVote = voteType;

      if (!currentUserVote) {
        // New vote
        newVoteCount += voteType === 'upvote' ? 1 : -1;
      } else if (currentUserVote === voteType) {
        // Remove vote
        newVoteCount += voteType === 'upvote' ? -1 : 1;
        newUserVote = null;
      } else {
        // Change vote (e.g., from downvote to upvote)
        newVoteCount += voteType === 'upvote' ? 2 : -2;
      }

      return {
        votes: { ...state.votes, [postId]: newVoteCount },
        userVotes: { ...state.userVotes, [postId]: newUserVote },
        loadingVotes: { ...state.loadingVotes, [postId]: true },
      };
    });
  },

  // Update vote from server response
  updateVoteFromServer: (postId, serverVotes, serverUserVote) => {
    set(state => ({
      votes: { ...state.votes, [postId]: serverVotes },
      userVotes: { ...state.userVotes, [postId]: serverUserVote },
      loadingVotes: { ...state.loadingVotes, [postId]: false },
    }));
  },

  // Reset vote to original state (for error handling)
  resetVote: (postId, originalVotes, originalUserVote) => {
    set(state => ({
      votes: { ...state.votes, [postId]: originalVotes },
      userVotes: { ...state.userVotes, [postId]: originalUserVote },
      loadingVotes: { ...state.loadingVotes, [postId]: false },
    }));
  },
}));

export default useVoteStore;
