'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowUp, ArrowDown, MessageCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import useVoteStore from '@/store/voteStore';

const PostDetailPage = () => {
  const { postId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPost(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !session?.user) return;
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      });
      if (response.ok) {
        const result = await response.json();
        setComment('');
        setPost(prev => ({
          ...prev,
          comments: [result.data, ...prev.comments]
        }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const votePost = async (type) => {
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
        const result = await response.json();
        setPost(prev => ({
          ...prev,
          votes: result.votes,
          userVote: result.userVote
        }));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-6"
        >
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
                  <ArrowUp className={`w-4 h-4 ${post.userVote === 'upvote' ? 'text-green-600 font-bold' : 'text-green-600'}`} />
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {post.votes || 0}
                </span>
                <button
                  onClick={() => votePost('downvote')}
                  className={`p-2 rounded-full transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 
                    ${post.userVote === 'downvote' ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                >
                  <ArrowDown className={`w-4 h-4 ${post.userVote === 'downvote' ? 'text-red-600 font-bold' : 'text-red-600'}`} />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.isAnonymous ? '/user.png' : post.profilePicture || '/user.png'} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                      {post.isAnonymous ? 'A' : post.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {post.isAnonymous ? 'Anonymous' : post.username}
                    </span>
                    <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 dark:border-amber-500 dark:text-amber-400">
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
                  {typeof post.content === 'string' ? post.content : JSON.stringify(post.content)}
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Comments ({post.comments?.length || 0})
                  </h3>

                  {session?.user && (
                    <div className="flex gap-2 mb-6">
                      <Input
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        Post
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {post.comments?.map(comment => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.username}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    ))}
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