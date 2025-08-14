'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { Image, Video, Send, X } from 'lucide-react';

const RichCommentInput = React.memo(({ postId, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { data: session } = useSession();
  const fileInputRef = useRef(null);

  const handleFileUpload = useCallback(async file => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return null;
    }
  }, []);

  const handleFileSelect = useCallback(
    async event => {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      setUploading(true);
      const newAttachments = [];

      for (const file of files) {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          const url = await handleFileUpload(file);
          if (url) {
            newAttachments.push({
              id: Date.now() + Math.random(),
              type: file.type.startsWith('image/') ? 'image' : 'video',
              url,
              name: file.name,
            });
          }
        } else {
          toast.error('Only images and videos are supported');
        }
      }

      setAttachments(prev => [...prev, ...newAttachments]);
      setUploading(false);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileUpload]
  );

  const removeAttachment = useCallback(id => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (
      (!comment.trim() && attachments.length === 0) ||
      !session?.user ||
      isSubmitting
    )
      return;

    setIsSubmitting(true);

    // Create rich content structure
    const richContent = [];

    if (comment.trim()) {
      richContent.push({
        id: `p-${Date.now()}`,
        type: 'p',
        children: [{ text: comment.trim() }],
      });
    }

    attachments.forEach((attachment, index) => {
      richContent.push({
        id: `${attachment.type}-${Date.now()}-${index}`,
        type: attachment.type === 'image' ? 'img' : 'video',
        url: attachment.url,
        name: attachment.name,
        children: [{ text: '' }],
        isUpload: true,
      });
    });

    // Optimistic UI update
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: richContent,
      username: session.user.name,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    onCommentAdded?.(optimisticComment);
    setComment('');
    setAttachments([]);

    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: richContent }),
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
  }, [
    comment,
    attachments,
    session?.user,
    isSubmitting,
    postId,
    onCommentAdded,
  ]);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Add a comment... (Ctrl+Enter to submit)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[80px] resize-none"
        disabled={isSubmitting}
      />

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div key={attachment.id} className="relative group">
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={attachment.url}
                  className="w-20 h-20 object-cover rounded-lg"
                  muted
                />
              )}
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isSubmitting}
          >
            <Image className="w-4 h-4 mr-1" />
            {uploading ? 'Uploading...' : 'Image'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isSubmitting}
          >
            <Video className="w-4 h-4 mr-1" />
            Video
          </Button>
        </div>

        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={
            (!comment.trim() && attachments.length === 0) ||
            isSubmitting ||
            uploading
          }
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
        >
          <Send className="w-4 h-4 mr-1" />
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  );
});

RichCommentInput.displayName = 'RichCommentInput';

export default RichCommentInput;
