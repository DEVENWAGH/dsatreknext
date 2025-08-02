'use client';

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const OptimizedCommentInput = React.memo(({ postId, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = useCallback(async () => {
    if (!comment.trim() || !session?.user || isSubmitting) return;

    setIsSubmitting(true);

    // Optimistic UI update
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: comment,
      username: session.user.name,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    onCommentAdded?.(optimisticComment);
    setComment('');

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      });

      if (response.ok) {
        const result = await response.json();
        // Replace optimistic comment with real one
        onCommentAdded?.(result.data, optimisticComment.id);
      } else {
        // Remove optimistic comment on error
        onCommentAdded?.(null, optimisticComment.id);
        toast.error('Failed to add comment');
      }
    } catch (error) {
      // Remove optimistic comment on error
      onCommentAdded?.(null, optimisticComment.id);
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [comment, session?.user, isSubmitting, postId, onCommentAdded]);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add a comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
        disabled={isSubmitting}
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={!comment.trim() || isSubmitting}
        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Posting...' : 'Post'}
      </Button>
    </div>
  );
});

OptimizedCommentInput.displayName = 'OptimizedCommentInput';

export default OptimizedCommentInput;
