import { useState, useCallback } from 'react';

export const useCommunityDiscussion = problemId => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiscussions = useCallback(async () => {
    if (!problemId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/community/problem/${problemId}`);
      const data = await response.json();

      if (data.success) {
        setDiscussions(data.data);
      } else {
        setError(data.message || 'Failed to fetch discussions');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [problemId]);

  const postDiscussion = useCallback(
    async (content, isAnonymous = false) => {
      if (!problemId || !content.trim()) return false;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/community/problem/${problemId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, isAnonymous }),
        });

        const data = await response.json();

        if (data.success) {
          await fetchDiscussions(); // Refresh discussions
          return true;
        } else {
          setError(data.message || 'Failed to post discussion');
          return false;
        }
      } catch (err) {
        setError('Network error occurred');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [problemId, fetchDiscussions]
  );

  return {
    discussions,
    loading,
    error,
    fetchDiscussions,
    postDiscussion,
  };
};
