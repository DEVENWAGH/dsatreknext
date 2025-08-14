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
import { useAuthStore } from '@/store/authStore';
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
const VirtualizedPostList = dynamic(
  () => import('@/components/community/VirtualizedPostList'),
  {
    loading: () => (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    ),
    ssr: false,
  }
);

const CommunityPage = () => {
  const { data: session } = useSession();
  const { authUser } = useAuthStore();
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState({});
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [userNewPosts, setUserNewPosts] = useState([]);

  const { data, error, isLoading: loading, refetch } = useCommunityPosts();
  const votePostMutation = useVotePost();

  // Auto-refresh for real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refetch]);

  // Listen for new posts and check sessionStorage fallback
  React.useEffect(() => {
    const handleNewPost = event => {
      console.log('New post event received:', event.detail);
      if (event.detail?.post) {
        setUserNewPosts(prev => {
          const newPosts = [event.detail.post, ...prev];
          console.log('Updated user new posts:', newPosts);
          return newPosts;
        });
        toast.success('Post created successfully!');
      }
    };

    // Check for new post in sessionStorage (fallback)
    const checkNewPost = () => {
      const newPost = sessionStorage.getItem('newPost');
      if (newPost) {
        try {
          const post = JSON.parse(newPost);
          console.log('Found new post in sessionStorage:', post);
          setUserNewPosts(prev => [post, ...prev]);
          sessionStorage.removeItem('newPost');
          toast.success('Post created successfully!');
        } catch (error) {
          console.error('Error parsing new post:', error);
        }
      }
    };

    window.addEventListener('newPostCreated', handleNewPost);
    checkNewPost();

    return () => window.removeEventListener('newPostCreated', handleNewPost);
  }, []);

  // Flatten paginated data and show user's posts first
  const posts = React.useMemo(() => {
    if (!data?.pages) return userNewPosts;
    const allPosts = data.pages.flatMap(page => page.posts || []);
    console.log(
      'Posts data for vote initialization:',
      allPosts.map(p => ({ id: p.id, votes: p.votes, userVote: p.userVote }))
    );

    // Combine and deduplicate posts
    const existingIds = new Set(allPosts.map(p => p.id));
    const uniqueNewPosts = userNewPosts.filter(p => !existingIds.has(p.id));
    const combinedPosts = [...uniqueNewPosts, ...allPosts];

    // Separate user's posts and others
    const userPosts = combinedPosts.filter(p => p.userId === session?.user?.id);
    const otherPosts = combinedPosts.filter(
      p => p.userId !== session?.user?.id
    );

    // Sort user posts by creation date (newest first), others keep original order
    userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const finalPosts = [...userPosts, ...otherPosts];
    useVoteStore.getState().initializeVotes(finalPosts);
    return finalPosts;
  }, [data, userNewPosts, session?.user?.id]);

  // Auto-enable virtualization for large lists
  React.useEffect(() => {
    setUseVirtualization((posts?.length || 0) > 20);
  }, [posts?.length]);

  const votePost = useCallback(
    async (postId, type) => {
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
          useVoteStore
            .getState()
            .updateVoteFromServer(postId, result.votes, result.userVote);
        } else {
          useVoteStore
            .getState()
            .resetVote(postId, originalVotes, originalUserVote);
          const error = await response.json();
          toast.error(error.error || 'Already voted on this post');
        }
      } catch (error) {
        useVoteStore
          .getState()
          .resetVote(postId, originalVotes, originalUserVote);
        console.error('Error voting:', error);
        toast.error('Failed to register vote');
      }
    },
    [session?.user, posts]
  );

  const deletePost = useCallback(
    async postId => {
      // Optimistic update - remove post immediately
      setUserNewPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');

      try {
        const response = await fetch(`/api/community/posts/${postId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          refetch(); // Refresh to sync with server
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete post');
          refetch(); // Revert on error
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
        refetch(); // Revert on error
      }
    },
    [refetch]
  );

  const deleteComment = useCallback(
    async (commentId, postId) => {
      // Optimistic update - remove comment immediately
      setOptimisticComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId),
      }));
      toast.success('Comment deleted');

      try {
        const response = await fetch(`/api/community/comments/${commentId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete comment');
          refetch(); // Revert on error
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('Failed to delete comment');
        refetch(); // Revert on error
      }
    },
    [refetch]
  );

  const editComment = useCallback(
    async (commentId, newContent, postId) => {
      try {
        const response = await fetch(`/api/community/comments/${commentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent }),
        });
        if (response.ok) {
          toast.success('Comment updated');
          setEditingComment(null);
          refetch();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to update comment');
        }
      } catch (error) {
        console.error('Error updating comment:', error);
        toast.error('Failed to update comment');
      }
    },
    [refetch]
  );

  const formatTimeAgo = useCallback(dateString => {
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

      // Optimistic update - add comment immediately
      const tempComment = {
        id: `temp-${Date.now()}`,
        content: comment,
        username: session.user.name || session.user.email,
        userId: session.user.id,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setOptimisticComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), tempComment],
      }));
      setComment('');
      toast.success('Comment added');

      try {
        const response = await fetch(
          `/api/community/posts/${postId}/comments`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: tempComment.content }),
          }
        );
        if (response.ok) {
          const result = await response.json();
          // Replace temp comment with real one
          setOptimisticComments(prev => ({
            ...prev,
            [postId]: (prev[postId] || []).map(c =>
              c.id === tempComment.id
                ? { ...result.data, isOptimistic: false }
                : c
            ),
          }));
        } else {
          // Remove temp comment on error
          setOptimisticComments(prev => ({
            ...prev,
            [postId]: (prev[postId] || []).filter(c => c.id !== tempComment.id),
          }));
          toast.error('Failed to add comment');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        setOptimisticComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(c => c.id !== tempComment.id),
        }));
        toast.error('Failed to add comment');
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
    const handleCardClick = e => {
      if (e.target.closest('button')) return;
      router.push(`/community/${post.id}`);
    };

    return (
      <Card
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200/50 dark:border-amber-500/20 rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-200 h-64"
        onClick={handleCardClick}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-start gap-4 flex-1">
            <VoteButtons postId={post.id} />

            <div className="flex-1 flex flex-col h-full">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
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
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                  {post.title}
                </h3>
                {(session?.user?.id === post.userId ||
                  authUser?.role === 'admin') && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deletePost(post.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                    title={
                      authUser?.role === 'admin'
                        ? 'Delete as admin'
                        : 'Delete your post'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 flex-1 overflow-hidden">
                <div className="line-clamp-3">
                  {typeof post.content === 'string'
                    ? post.content.length > 150
                      ? post.content.substring(0, 150) + '...'
                      : post.content
                    : 'Click to view full content'}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    router.push(`/community/${post.id}`);
                  }}
                  className="hover:text-amber-600 transition-colors flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.comments?.length || 0}
                </button>
                <span className="text-xs text-gray-400">
                  Click to view post
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  });

  PostCard.displayName = 'PostCard';

  const EditCommentForm = ({ comment, onSave, onCancel }) => {
    const [content, setContent] = useState(comment.content);

    const handleSave = () => {
      if (content.trim()) {
        onSave(content.trim());
      }
    };

    return (
      <div className="space-y-2">
        <Input
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          className="text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={!content.trim()}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

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
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
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
              <Suspense
                fallback={
                  <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                }
              >
                <VirtualizedPostList
                  posts={posts}
                  PostCard={PostCard}
                  height={600}
                />
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
