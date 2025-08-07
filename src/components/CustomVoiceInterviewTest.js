'use client';

import { useState } from 'react';
import { useCustomVoiceInterview } from '@/hooks/useCustomVoiceInterview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mic,
  MicOff,
  Square,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
  Volume2,
} from 'lucide-react';

export default function CustomVoiceInterviewTest() {
  const [showTranscript, setShowTranscript] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // Test interview configuration
  const testConfig = {
    position: 'Front-End Developer',
    interviewType: 'Technical Interview',
    language: 'english',
    difficulty: 'medium',
    duration: '30 minutes',
    questions: [
      'Tell me about yourself and your experience with front-end development.',
      'What are your favorite JavaScript frameworks and why?',
      'How do you ensure your web applications are accessible?',
      'Describe a challenging project you worked on recently.',
      'What are your thoughts on modern CSS methodologies like CSS-in-JS?',
      'How do you approach performance optimization in React applications?'
    ]
  };
      'Tell me about yourself and your experience with front-end development.',
      'What are your favorite JavaScript frameworks and why?',
      'How do you ensure your web applications are accessible?',
      'Describe a challenging project you worked on recently.',
      'What are your thoughts on modern CSS methodologies?'
    ]
  };

  const {
    isConnected,
    isListening,
    isSpeaking,
    conversation,
    error,
    status,
    startInterview,
    endInterview,
    getTranscript,
    getInterviewStats,
    clearError,
    testMicrophone,
    testConfiguration,
  } = useCustomVoiceInterview(testConfig);

  // Handle start interview
  const handleStartInterview = async () => {
    try {
      clearError();

      // Test microphone access
      const micTest = await testMicrophone();
      if (!micTest) return;

      // Test configuration
      const configTest = await testConfiguration();
      if (!configTest) return;

      const success = await startInterview();
      if (success) {
        setInterviewStarted(true);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  // Handle end interview
  const handleEndInterview = async () => {
    try {
      const result = await endInterview();
      console.log('Interview ended:', result);
      setInterviewStarted(false);
    } catch (error) {
      console.error('Error ending interview:', error);
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'initializing':
        return 'secondary';
      case 'active':
      case 'listening':
        return 'default';
      case 'speaking':
        return 'default';
      case 'ended':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get status display text
  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready to start';
      case 'initializing':
        return 'Initializing...';
      case 'active':
        return 'Interview active';
      case 'listening':
        return 'Listening...';
      case 'speaking':
        return 'AI Speaking...';
      case 'ending':
        return 'Ending interview...';
      case 'ended':
        return 'Interview completed';
      case 'error':
        return 'Error occurred';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Custom Voice Interview Test</CardTitle>
              <p className="text-muted-foreground">
                Testing Deepgram STT/TTS + Gemini AI Integration
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant()}>{getStatusText()}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={clearError}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Interview Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {!interviewStarted ? (
              <Button
                onClick={handleStartInterview}
                disabled={status === 'initializing'}
                className="flex items-center gap-2"
              >
                {status === 'initializing' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Test Interview
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {isConnected && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  )}

                  {isListening && (
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-600">Listening</span>
                    </div>
                  )}

                  {isSpeaking && (
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-purple-600">AI Speaking</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleEndInterview}
                  variant="destructive"
                  disabled={status === 'ending'}
                  className="flex items-center gap-2"
                >
                  {status === 'ending' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  End Interview
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interview Stats */}
      {conversation.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Interview Progress</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTranscript(!showTranscript)}
              >
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{conversation.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total Messages
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {conversation.filter(msg => msg.role === 'user').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Your Responses
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {conversation.filter(msg => msg.role === 'assistant').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  AI Messages
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Transcript */}
      {showTranscript && conversation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {conversation.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-gray-50 border-l-4 border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        message.role === 'user' ? 'default' : 'secondary'
                      }
                    >
                      {message.role === 'user' ? 'You' : 'AI Interviewer'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Test Instructions</h3>
            <p className="text-sm text-muted-foreground">
              This is a test of the custom voice interview system using:
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• <strong>STT:</strong> Deepgram Nova-2 for speech recognition</p>
              <p>• <strong>AI:</strong> Google Gemini 1.5 Pro for conversation</p>
              <p>• <strong>TTS:</strong> Deepgram Aura for text-to-speech</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure you have DEEPGRAM_API_KEY and GEMINI_API_KEY configured in your environment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
