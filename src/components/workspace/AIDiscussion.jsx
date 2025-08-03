import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send,
  Bot,
  User,
  Settings,
  Copy,
  Check,
  Loader2,
  Brush,
  Clock,
} from 'lucide-react';
import { useAIDiscussion } from '@/hooks/useAIDiscussion';
import { useAuthStore } from '@/store/authStore';
import { DISCUSSION_MODELS, DEFAULT_DISCUSSION_MODEL } from '@/utils/aiModels';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ShinyText from '@/components/ui/shiny-text';
import { SmoothScroll } from '@/components/ui/smooth-scroll';
const AIDiscussion = ({ problem, editorRef }) => {
  const { messages, isLoading, sendMessage, clearMessages } = useAIDiscussion();
  const [localMessages, setLocalMessages] = useState([]);

  const addMessage = message => {
    setLocalMessages(prev => {
      const existing = prev.find(m => m.id === message.id);
      const newMessages = existing
        ? prev.map(m => (m.id === message.id ? message : m))
        : [...prev, message];

      // Save to localStorage
      const sessionKey = `ai-discussion-${problem?.id}`;
      localStorage.setItem(sessionKey, JSON.stringify(newMessages));

      return newMessages;
    });
  };

  const displayMessages = localMessages.length > 0 ? localMessages : messages;
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_DISCUSSION_MODEL);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef(null);
  const { authUser } = useAuthStore();
  const [userAvatar, setUserAvatar] = useState(null);

  // Fetch user profile picture like navigation does
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (authUser?.id) {
        try {
          const userResponse = await fetch(`/api/users/${authUser.id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success && userData.data.profilePicture) {
              setUserAvatar(userData.data.profilePicture);
            }
          }
        } catch (error) {
          console.error('Error fetching user avatar:', error);
        }
      }
    };
    fetchUserAvatar();
  }, [authUser?.id]);

  useEffect(() => {
    const sessionKey = `ai-discussion-${problem?.id}`;
    const savedMessages = localStorage.getItem(sessionKey);

    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setLocalMessages(parsed);
    } else if (messages.length === 0) {
      const userName =
        `${authUser?.firstName || ''} ${authUser?.lastName || ''}`.trim() ||
        'there';
      const welcomeText = `Hi ${userName}! I am DSATrek Bot, your AI Assistant. I'm here to help you with "${problem?.title || 'this problem'}". I can explain algorithms, discuss approaches, and provide hints. How can I assist you today?`;

      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant',
        content: '',
        fullContent: welcomeText,
        timestamp: new Date(),
        isTyping: true,
      };
      addMessage(welcomeMessage);

      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < welcomeText.length) {
          const updatedMessage = {
            ...welcomeMessage,
            content: welcomeText.slice(0, index + 1),
            isTyping: index < welcomeText.length - 1,
          };
          addMessage(updatedMessage);
          index++;
          scrollToBottom();
        } else {
          clearInterval(typeInterval);
        }
      }, 30);
    }
  }, [problem?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, localMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputMessage('');

    // Remove conversation history to save tokens
    const conversationHistory = [];

    const userCode = editorRef?.current?.getValue() || '';
    const solution = problem?.solution || '';
    const result = await sendMessage({
      message: inputMessage,
      problem,
      model: selectedModel,
      conversationHistory,
      userCode,
      solution,
    });

    if (result.success) {
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        fullContent: result.response,
        model: result.model,
        timestamp: new Date(),
        isTyping: true,
      };
      addMessage(aiMessage);

      // Animate typing effect for AI response
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < result.response.length) {
          addMessage({
            ...aiMessage,
            content: result.response.slice(0, index + 1),
            isTyping: index < result.response.length - 1,
          });
          index++;
          scrollToBottom();
        } else {
          clearInterval(typeInterval);
        }
      }, 20);
    } else if (result.suggestModelChange) {
      setShowModelSelector(true);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    clearMessages();
    setLocalMessages([]);
    const sessionKey = `ai-discussion-${problem?.id}`;
    localStorage.removeItem(sessionKey);
  };

  const getModelDisplayName = modelId => {
    const model = DISCUSSION_MODELS.find(m => m.id === modelId);
    return model ? `${model.name} (${model.provider})` : modelId;
  };

  return (
    <div className="relative h-full w-full">
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-0 z-10 border-b bg-background">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModelSelector(!showModelSelector)}
              title="Model Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            {(messages.length > 0 || localMessages.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
                title="Clear Chat"
              >
                <Brush className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Model Selector */}
        {showModelSelector && (
          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Model:</span>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISCUSSION_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Messages */}
      <div className="absolute top-16 bottom-20 left-0 right-0">
        <SmoothScroll className="h-full p-3 custom-scrollbar">
          <div className="space-y-3">
            {displayMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
                <p className="text-lg font-medium mb-2">
                  Loading AI Assistant...
                </p>
              </div>
            ) : (
              displayMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-500 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <Card
                    className={`max-w-[85%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    <CardContent>
                      <div className="text-sm leading-relaxed">
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            components={{
                              code({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }) {
                                const match = /language-(\w+)/.exec(
                                  className || ''
                                );
                                const [copied, setCopied] = useState(false);

                                const handleCopy = () => {
                                  navigator.clipboard.writeText(
                                    String(children).replace(/\n$/, '')
                                  );
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                };

                                return !inline && match ? (
                                  <div className="relative">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="absolute top-2 right-2 h-6 w-6 p-0"
                                      onClick={handleCopy}
                                    >
                                      {copied ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <SyntaxHighlighter
                                      style={oneDark}
                                      language={match[1]}
                                      PreTag="div"
                                      className="rounded-md"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code
                                    className="bg-muted px-1 py-0.5 rounded text-xs"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        )}
                      </div>
                      {message.model && (
                        <div className="mt-1 text-xs opacity-70">
                          <span>
                            {
                              DISCUSSION_MODELS.find(
                                m => m.id === message.model
                              )?.name
                            }
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <img
                        src={userAvatar || authUser?.image || '/user.png'}
                        alt={authUser?.name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </Avatar>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <ShinyText text="Thinking..." className="text-sm" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </SmoothScroll>
      </div>

      {/* Fixed Input */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-background z-10">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about algorithms, approaches, or get hints..."
            className="min-h-[40px] max-h-[80px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="h-[40px] px-3 self-end"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIDiscussion;
