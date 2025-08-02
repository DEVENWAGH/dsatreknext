'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommunityEditor } from '@/components/CommunityEditor';
import Image from 'next/image';
import ReactPlayer from 'react-player';
import { SmoothScroll } from '@/components/ui/smooth-scroll';

export default function ProblemDiscussion({ problemId }) {
  const { data: session } = useSession();
  const [discussions, setDiscussions] = useState([]);
  const [content, setContent] = useState([
    { type: 'p', children: [{ text: '' }] },
  ]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

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

  const handleSubmit = async () => {
    if (!content || loading || !session?.user) return;

    // Check if content is empty
    const hasContent = content.some(block => {
      if (block.type === 'p') {
        return block.children?.some(child => child.text?.trim());
      }
      return block.text?.trim() || block.url;
    });

    if (!hasContent) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/community/problem/${problemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, isAnonymous }),
      });

      if (response.ok) {
        setContent([{ type: 'p', children: [{ text: '' }] }]);
        setIsAnonymous(false);
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Error posting:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const response = await fetch(`/api/community/problem/${problemId}`);
      const data = await response.json();
      if (data.success) {
        setDiscussions(data.data);
      }
    } catch (error) {
      console.error('Error fetching:', error);
    }
  };

  const handleDelete = async discussionId => {
    if (!confirm('Are you sure you want to delete this discussion?')) return;

    try {
      const response = await fetch(
        `/api/community/problem/${problemId}/${discussionId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [problemId]);

  const getUserAvatar = () => {
    if (isAnonymous) return '/user.png';
    return userProfile?.profilePicture || session?.user?.image || '/user.png';
  };

  const renderContent = content => {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      const elements = [];

      for (let i = 0; i < content.length; i++) {
        const block = content[i];
        const key = block.id || `block-${i}`;

        if (block.type === 'img') {
          elements.push(
            <Image
              key={key}
              src={block.url}
              alt=""
              className="max-w-full h-auto rounded-lg my-2"
              width={block.width || 500}
              height={block.height || 300}
            />
          );
        } else if (block.type === 'video') {
          elements.push(
            <div
              key={key}
              className="my-2 rounded-lg overflow-hidden"
              style={{ maxHeight: '400px' }}
            >
              <ReactPlayer
                url={block.url}
                controls
                width="100%"
                height="400px"
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                    },
                  },
                }}
              />
            </div>
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

          elements.push(
            <p key={key} className="mb-2">
              {content}
            </p>
          );
        } else if (block.type === 'code_block') {
          const codeContent =
            block.children
              ?.map(line => line.children?.[0]?.text || '')
              .join('\n') ||
            block.text ||
            '';
          elements.push(
            <CodeBlock
              key={key}
              code={codeContent}
              language={block.lang || 'javascript'}
            />
          );
        } else if (block.type === 'h1') {
          const text =
            block.children?.map(child => {
              if (child.type === 'a') {
                return (
                  <a
                    key={child.id || `link-${Math.random()}`}
                    href={child.url}
                    target={child.target}
                    className="text-blue-600 hover:underline"
                  >
                    {child.children?.[0]?.text || ''}
                  </a>
                );
              }
              return child.text || '';
            }) || '';

          elements.push(
            <h3 key={key} className="font-bold text-lg mb-2">
              {text}
            </h3>
          );
        }
      }

      return <div>{elements}</div>;
    }

    return '';
  };

  const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? 'Copied!' : 'Copy'}
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

  return (
    <div className="space-y-6">
      {session?.user && (
        <>
          {/* Header */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-500/20 shadow-xl">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar
                    className="w-12 h-12 cursor-pointer transition-all hover:scale-105 ring-2 ring-amber-400/30 hover:ring-amber-400/60"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                  >
                    <AvatarImage
                      src={getUserAvatar()}
                      className="object-cover"
                    />
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
                  <span className="text-sm text-amber-600 dark:text-amber-400">
                    Problem Discussion
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-500/20 shadow-xl overflow-hidden">
            <CommunityEditor
              onContentChange={handleContentChange}
              wrapToolbar={true}
            />
          </div>
        </>
      )}

      {/* Discussions */}
      <div className="space-y-3">
        {discussions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No discussions yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          discussions.map(discussion => (
            <div
              key={discussion.id}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-500/20 shadow-xl p-6"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={discussion.isAnonymous ? '/user.png' : '/user.png'}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                    {discussion.isAnonymous
                      ? 'A'
                      : discussion.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{discussion.username}</span>
                      <span className="text-gray-500">
                        {new Date(discussion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {discussion.userId === session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(discussion.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                    {renderContent(discussion.content)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
