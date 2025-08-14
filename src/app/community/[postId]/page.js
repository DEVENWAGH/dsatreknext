'use client';
import Image from 'next/image';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import OptimizedCommentInput from '@/components/community/OptimizedCommentInput';
import RichCommentInput from '@/components/community/RichCommentInput';
import SimpleCommentInput from '@/components/community/SimpleCommentInput';
import CommentItem from '@/components/community/CommentItem';
import { useComments } from '@/hooks/useComments';
import { useCommunityPost } from '@/hooks/useCommunity';

const PostDetailPage = () => {
  const { postId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const {
    data: postData,
    isLoading: postLoading,
    error: postError,
  } = useCommunityPost(postId);
  const {
    data: commentsData,
    isLoading: commentsLoading,
    mutate: mutateComments,
  } = useComments(postId);
  const [optimisticComments, setOptimisticComments] = React.useState([]);

  const post = postData?.data;
  const allComments = [...(commentsData?.data || []), ...optimisticComments];

  // Debug logging
  React.useEffect(() => {
    console.log('Comments data:', commentsData);
    console.log('Optimistic comments:', optimisticComments);
    console.log('All comments:', allComments);
  }, [commentsData, optimisticComments, allComments]);

  const renderContent = content => {
    if (!content) return 'Content not available';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map((block, index) => {
        if (block && block.type === 'p') {
          return (
            <p key={block.id || index} className="mb-2">
              {block.children?.map(child => child?.text || '').join('') || ''}
            </p>
          );
        }
        if (block?.type === 'img' && block?.url) {
          return (
            <Image
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
    if (typeof content === 'object') {
      // Handle object content safely
      try {
        return JSON.stringify(content, null, 2);
      } catch {
        return 'Content not available';
      }
    }
    return 'Content not available';
  };

  const handleCommentAdded = (newComment, tempId) => {
    if (!newComment && tempId) {
      // Remove failed optimistic comment
      setOptimisticComments(prev => prev.filter(c => c.id !== tempId));
    } else if (newComment && tempId) {
      // Replace optimistic comment with real one - don't remove, just update
      setOptimisticComments(prev =>
        prev.map(c =>
          c.id === tempId ? { ...newComment, isOptimistic: false } : c
        )
      );
    } else if (newComment) {
      // Add optimistic comment
      setOptimisticComments(prev => [...prev, newComment]);
    }
  };

  const handleCommentUpdated = updatedComment => {
    setOptimisticComments(prev =>
      prev.map(c => (c.id === updatedComment.id ? updatedComment : c))
    );
    mutateComments();
  };

  const handleCommentDeleted = commentId => {
    setOptimisticComments(prev => prev.filter(c => c.id !== commentId));
    mutateComments();
  };

  const votePost = async type => {
    if (!session?.user) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, postId }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  if (postLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  if (postError || !post)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Post not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200/50 dark:border-amber-500/20 rounded-2xl shadow-xl">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => votePost('upvote')}
                  className={`p-2 rounded-full transition-colors hover:bg-green-100 dark:hover:bg-green-900/20 
                    ${post.userVote === 'upvote' ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                >
                  <ArrowUp
                    className={`w-4 h-4 ${post.userVote === 'upvote' ? 'text-green-600 font-bold' : 'text-green-600'}`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {post.votes || 0}
                </span>
                <button
                  onClick={() => votePost('downvote')}
                  className={`p-2 rounded-full transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 
                    ${post.userVote === 'downvote' ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                >
                  <ArrowDown
                    className={`w-4 h-4 ${post.userVote === 'downvote' ? 'text-red-600 font-bold' : 'text-red-600'}`}
                  />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={
                        post.isAnonymous
                          ? '/user.png'
                          : post.profilePicture || '/user.png'
                      }
                    />
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                      {post.isAnonymous ? 'A' : post.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {post.isAnonymous ? 'Anonymous' : post.username}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-amber-200 text-amber-700 dark:border-amber-500 dark:text-amber-400"
                    >
                      {post.topic}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>

                <h1 className="font-semibold text-2xl text-gray-900 dark:text-white mb-4">
                  {post.title}
                </h1>

                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 mb-6">
                  {renderContent(post.content)}
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Comments (
                    {(commentsData?.data?.length || 0) +
                      optimisticComments.length}
                    )
                  </h3>

                  {session?.user && (
                    <div className="mb-6">
                      <SimpleCommentInput
                        postId={postId}
                        onCommentAdded={handleCommentAdded}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {commentsLoading ? (
                      <div className="text-center py-4 text-gray-500">
                        Loading comments...
                      </div>
                    ) : allComments.length > 0 ? (
                      allComments.map(comment => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          onCommentUpdated={handleCommentUpdated}
                          onCommentDeleted={handleCommentDeleted}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PostDetailPage;
