'use client';

import React, { useState, useCallback, useMemo, Suspense } from 'react';
import useVoteStore from '@/store/voteStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useCommunityPosts, useVotePost } from '@/hooks/useCommunity';
import dynamic from 'next/dynamic';
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

// Dynamic import for virtualized list (only load when needed)
const VirtualizedPostList = dynamic(() => import('@/components/community/VirtualizedPostList'), {
  loading: () => <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}</div>,
  ssr: false
});

const CommunityPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showComments, setShowComments] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [copiedCode, setCopiedCode] = useState({});
  const [useVirtualization, setUseVirtualization] = useState(false);

  const { data, error, isLoading: loading } = useCommunityPosts();
  const votePostMutation = useVotePost();
  
  // Flatten paginated data
  const posts = React.useMemo(() => {
    if (!data?.pages) return [];
    const allPosts = data.pages.flatMap(page => page.posts || []);
    useVoteStore.getState().initializeVotes(allPosts);
    return allPosts;
  }, [data]);

  // Auto-enable virtualization for large lists
  React.useEffect(() => {
    setUseVirtualization((posts?.length || 0) > 20);
  }, [posts?.length]);

  const votePost = useCallback(async (postId, type) => {
    if (!session?.user) {
      toast.error('Please sign in to vote');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const originalVotes = post.votes || 0;
    const originalUserVote = post.userVote;

    // Optimistic update
    useVoteStore.getState().voteOnPost(postId, type);
    toast.success(`Vote ${type === 'upvote' ? 'up' : 'down'} registered`);

    try {
      const response = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, postId }),
      });

      if (response.ok) {
        const result = await response.json();
        useVoteStore.getState().updateVoteFromServer(postId, result.votes, result.userVote);
      } else {
        useVoteStore.getState().resetVote(postId, originalVotes, originalUserVote);
        const error = await response.json();
        toast.error(error.error || 'Already voted on this post');
      }
    } catch (error) {
      useVoteStore.getState().resetVote(postId, originalVotes, originalUserVote);
      console.error('Error voting:', error);
      toast.error('Failed to register vote');
    }
  }, [session?.user, posts]);

  const deletePost = useCallback(async (postId) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Post deleted');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  }, []);

  const deleteComment = useCallback(async (commentId, postId) => {
    try {
      const response = await fetch(`/api/community/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Comment deleted');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  }, []);

  const formatTimeAgo = useCallback((dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  }, []);

  const renderContent = useCallback((content, isExpanded = false) => {
    if (typeof content === 'string') {
      return isExpanded || content.length <= 300
        ? content
        : content.substring(0, 300) + '...';
    }

    if (Array.isArray(content)) {
      const elements = [];
      let textLength = 0;
      let hasCodeBlock = false;

      for (const block of content) {
        if (block.type === 'code_block') {
          hasCodeBlock = true;
          const codeContent =
            block.children
              ?.map(line => line.children?.[0]?.text || '')
              .join('\n') ||
            block.text ||
            '';
          elements.push(
            <CodeBlock
              key={block.id}
              code={codeContent}
              language={block.lang || 'javascript'}
              blockId={block.id}
            />
          );
        } else if (block.type === 'p') {
          const content =
            block.children?.map((child, childIndex) => {
              if (child.type === 'a') {
                return (
                  <a
                    key={childIndex}
                    href={child.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {child.children?.[0]?.text || child.text || ''}
                  </a>
                );
              } else if (child.code) {
                return (
                  <code
                    key={childIndex}
                    className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                  >
                    {child.text}
                  </code>
                );
              }
              return child.text || '';
            }) || [];

          const textContent =
            block.children?.map(child => child.text || '').join('') || '';
          textLength += textContent.length;

          if (!isExpanded && !hasCodeBlock && textLength > 300) {
            const remainingChars = 300 - (textLength - textContent.length);
            const truncatedText =
              textContent.substring(0, remainingChars) + '...';
            elements.push(
              <p key={block.id} className="mb-2">
                {truncatedText}
              </p>
            );
            break;
          }

          elements.push(
            <p key={block.id} className="mb-2">
              {content}
            </p>
          );
        }
      }

      return <div>{elements}</div>;
    }

    return '';
  }, []);

  const CommentInput = ({ postId }) => {
    const [comment, setComment] = useState('');

    CommentInput.displayName = 'CommentInput';

    const handleSubmit = async () => {
      if (!comment.trim() || !session?.user) return;
      try {
        const response = await fetch(
          `/api/community/posts/${postId}/comments`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: comment }),
          }
        );
        if (response.ok) {
          const result = await response.json();
          setComment('');
          toast.success('Comment added');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
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
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
        >
          Post
        </Button>
      </div>
    );
  };

  // Create a separate VoteButtons component to use Zustand
  const VoteButtons = React.memo(({ postId }) => {
    // Get vote data from store with selector
    const votes = useVoteStore(state => state.votes[postId] || 0);
    const userVote = useVoteStore(state => state.userVotes[postId] || null);
    const isLoading = useVoteStore(
      state => state.loadingVotes[postId] || false
    );

    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => votePost(postId, 'upvote')}
          disabled={isLoading}
          className={`p-2 rounded-full transition-colors hover:bg-green-100 dark:hover:bg-green-900/20 
            ${userVote === 'upvote' ? 'bg-green-100 dark:bg-green-900/30' : ''}
            ${isLoading ? 'animate-pulse' : ''}`}
        >
          <ArrowUp
            className={`w-4 h-4 ${userVote === 'upvote' ? 'text-green-600 font-bold' : 'text-green-600'}`}
          />
        </button>
        <span
          className={`text-sm font-medium text-gray-900 dark:text-white ${isLoading ? 'animate-pulse' : ''}`}
        >
          {votes}
        </span>
        <button
          onClick={() => votePost(postId, 'downvote')}
          disabled={isLoading}
          className={`p-2 rounded-full transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 
            ${userVote === 'downvote' ? 'bg-red-100 dark:bg-red-900/30' : ''}
            ${isLoading ? 'animate-pulse' : ''}`}
        >
          <ArrowDown
            className={`w-4 h-4 ${userVote === 'downvote' ? 'text-red-600 font-bold' : 'text-red-600'}`}
          />
        </button>
      </div>
    );
  });

  VoteButtons.displayName = 'VoteButtons';

  const CodeBlock = ({ code, language, blockId }) => {
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedCode(prev => ({ ...prev, [blockId]: true }));
        setTimeout(() => {
          setCopiedCode(prev => ({ ...prev, [blockId]: false }));
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    return (
      <div className="relative bg-gray-900 rounded-lg overflow-hidden my-4">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-300 font-medium">{language}</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            {copiedCode[blockId] ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copiedCode[blockId] ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono text-gray-100 whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    );
  };

  const PostCard = React.memo(({ post }) => {
    return (
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200/50 dark:border-amber-500/20 rounded-2xl shadow-xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <VoteButtons postId={post.id} />

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
                    {formatTimeAgo(post.createdAt)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {post.title}
                </h3>
                {session?.user?.id === post.userId && (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    !expandedPosts[post.id] ? 'max-h-32' : 'max-h-none'
                  }`}
                >
                  {renderContent(post.content, expandedPosts[post.id])}
                </div>
                {(typeof post.content === 'string'
                  ? post.content.length > 300
                  : Array.isArray(post.content) && 
                    (post.content.some(block => block.type === 'p' && 
                      block.children?.map(child => child.text || '').join('').length > 300) ||
                     post.content.length > 2)) && (
                  <button
                    onClick={() => {
                      setExpandedPosts(prev => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }));
                    }}
                    className="text-amber-600 hover:text-amber-700 text-sm mt-2 block transition-colors"
                  >
                    {expandedPosts[post.id] ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <button
                  onClick={() =>
                    setShowComments(prev => ({
                      ...prev,
                      [post.id]: !prev[post.id],
                    }))
                  }
                  className="hover:text-amber-600 transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.comments?.length || 0} Comments
                </button>
              </div>

              {showComments[post.id] && (
                <div className="mt-4 space-y-3">
                  {post.comments?.map(comment => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        {session?.user?.id === comment.userId && (
                          <button
                            onClick={() => deleteComment(comment.id, post.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                  <CommentInput postId={post.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  });

  PostCard.displayName = 'PostCard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
              Community
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share knowledge and connect with developers
            </p>
          </div>

          {session?.user && (
            <Button
              onClick={() => router.push('/community/create')}
              className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          )}
        </div>

        <ErrorBoundary>
          <div className="space-y-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200/50 dark:border-amber-500/20 rounded-2xl shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-4/5" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : error ? (
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-red-200/50 dark:border-red-500/20 rounded-2xl shadow-xl">
                <CardContent className="p-8 text-center">
                  <p className="text-red-600 dark:text-red-400 mb-4">
                    Failed to load posts: {error.message}
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : !posts || posts.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200/50 dark:border-amber-500/20 rounded-2xl shadow-xl">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-amber-500/60 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No posts yet. Be the first to start the conversation!
                  </p>
                </CardContent>
              </Card>
            ) : useVirtualization && posts?.length ? (
              <Suspense fallback={<div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}</div>}>
                <VirtualizedPostList posts={posts} PostCard={PostCard} height={600} />
              </Suspense>
            ) : (
              posts?.map(post => <PostCard key={post.id} post={post} />) || []
            )}
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default CommunityPage;
