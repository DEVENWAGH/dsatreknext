'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const CommentItem = ({ comment, onCommentUpdated, onCommentDeleted }) => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(
    typeof comment.content === 'string'
      ? comment.content
      : Array.isArray(comment.content)
        ? comment.content
            .filter(block => block.type === 'p')
            .map(
              block =>
                block.children?.map(child => child?.text || '').join('') || ''
            )
            .join('\n')
        : ''
  );
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = session?.user?.id === comment.userId;

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/community/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        onCommentUpdated?.(result.data);
        setIsEditing(false);
        toast.success('Comment updated');
      } else {
        toast.error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/community/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onCommentDeleted?.(comment.id);
        toast.success('Comment deleted');
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = content => {
    if (!content) return 'Content not available';

    if (typeof content === 'string') return content;

    if (Array.isArray(content)) {
      return content.map((block, index) => {
        if (block?.type === 'p') {
          return (
            <p key={block.id || index} className="mb-2">
              {block.children?.map(child => child?.text || '').join('') || ''}
            </p>
          );
        }
        if (block?.type === 'img' && block?.url) {
          return (
            <img
              key={block.id || index}
              src={block.url}
              alt={block.name || 'Image'}
              className="max-w-full h-auto rounded-lg my-2"
              loading="lazy"
            />
          );
        }
        if (block?.type === 'video' && block?.url) {
          return (
            <video
              key={block.id || index}
              src={block.url}
              controls
              className="max-w-full h-auto rounded-lg my-2"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          );
        }
        return null;
      });
    }

    return 'Content not available';
  };

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${comment.isOptimistic ? 'opacity-80 border-l-2 border-amber-500' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={comment.profilePicture || '/user.png'} />
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs">
              {comment.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{comment.username}</span>
          <span className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span className="ml-1 text-xs text-gray-400">(edited)</span>
            )}
          </span>
        </div>

        {isOwner && !comment.isOptimistic && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isLoading}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="text-sm min-h-[60px]"
            disabled={isLoading}
            placeholder="Edit your comment..."
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleEdit}
              disabled={isLoading || !editContent.trim()}
            >
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditContent(
                  typeof comment.content === 'string'
                    ? comment.content
                    : Array.isArray(comment.content)
                      ? comment.content
                          .filter(block => block.type === 'p')
                          .map(
                            block =>
                              block.children
                                ?.map(child => child?.text || '')
                                .join('') || ''
                          )
                          .join('\n')
                      : ''
                );
              }}
              disabled={isLoading}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {renderContent(comment.content)}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
