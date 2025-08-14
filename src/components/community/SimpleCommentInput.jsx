'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const SimpleCommentInput = ({ postId, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async () => {
    if (!comment.trim() || !session?.user || isSubmitting) return;

    setIsSubmitting(true);
    console.log('Submitting comment:', comment);

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment.trim() }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Comment created:', result);

        onCommentAdded?.(result.data);
        setComment('');
        toast.success('Comment added!');
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add a comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className="flex-1"
        disabled={isSubmitting}
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={!comment.trim() || isSubmitting}
        className="bg-amber-500 hover:bg-amber-600"
      >
        {isSubmitting ? 'Posting...' : 'Post'}
      </Button>
    </div>
  );
};

export default SimpleCommentInput;
