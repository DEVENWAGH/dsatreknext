'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Send } from 'lucide-react';
import { CommunityEditor } from '@/components/CommunityEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CreatePostPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState([
    { type: 'p', children: [{ text: '' }] },
  ]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('Interview');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const topics = ['Interview', 'Career', 'Compensation', 'Feedback'];

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (response.ok) {
            const userData = await response.json();
            if (userData.success) {
              setUserProfile(userData.data);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [session?.user?.id]);

  const handleContentChange = newContent => {
    setContent(newContent);
  };

  const createPost = async () => {
    if (!title.trim() || !content || !session?.user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          isAnonymous,
          topic: selectedTopic,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Post created, dispatching event:', result.data);

        // Create complete post object with user info
        const postWithUserInfo = {
          ...result.data,
          username: isAnonymous ? 'Anonymous' : session.user.name,
          profilePicture: isAnonymous
            ? '/user.png'
            : userProfile?.profilePicture || session.user.image,
          isAnonymous,
          topic: selectedTopic,
          votes: 0,
          userVote: null,
          comments: [],
        };

        // Dispatch event with complete post data
        window.dispatchEvent(
          new CustomEvent('newPostCreated', {
            detail: { post: postWithUserInfo },
          })
        );

        // Store in sessionStorage as fallback
        sessionStorage.setItem('newPost', JSON.stringify(postWithUserInfo));

        router.push('/community');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserAvatar = () => {
    if (isAnonymous) return '/user.png';
    return userProfile?.profilePicture || session?.user?.image || '/user.png';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className=" w-3/4 mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-500/20 shadow-xl mb-6">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar
                  className="w-12 h-12 cursor-pointer transition-all hover:scale-105 ring-2 ring-amber-400/30 hover:ring-amber-400/60"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                >
                  <AvatarImage src={getUserAvatar()} className="object-cover" />
                  <AvatarFallback
                    className={
                      isAnonymous
                        ? 'bg-gray-600 text-white'
                        : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white font-semibold'
                    }
                  >
                    {isAnonymous ? 'A' : session?.user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute -top-10 -left-8 bg-gray-800 text-white rounded-lg text-xs px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-30">
                  Click to toggle anonymous
                </div>
              </div>

              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {isAnonymous ? 'Anonymous' : session?.user?.name}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 gap-1 p-0 h-auto font-medium"
                    >
                      {selectedTopic}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-amber-200/50 dark:border-amber-500/20">
                    {topics.map(topic => (
                      <DropdownMenuItem
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className="hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      >
                        {topic}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Button
              onClick={createPost}
              disabled={!title.trim() || loading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>

        {/* Title Input */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-500/20 shadow-xl mb-6 p-6">
          <Input
            placeholder="What's on your mind?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Community Editor */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-500/20 shadow-xl overflow-hidden">
          <CommunityEditor onContentChange={handleContentChange} />
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
