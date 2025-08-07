'use client';

import { useState, useEffect } from 'react';
import { useDeepgramInterview } from '@/hooks/useDeepgramInterview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Square,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DeepgramVoiceInterview({
  interviewConfig,
  onInterviewComplete,
  onInterviewCancel,
}) {
  const {
    isConnected,
    isRecording,
    conversation,
    error,
    interviewStatus,
    startInterview,
    endInterview,
    getTranscript,
    getInterviewStats,
    clearError,
  } = useDeepgramInterview(interviewConfig);

  const [showTranscript, setShowTranscript] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // Handle interview completion
  const handleEndInterview = async () => {
    try {
      const result = await endInterview();

      if (result.success) {
        const transcript = getTranscript();
        const stats = getInterviewStats();

        onInterviewComplete({
          transcript,
          stats,
          interviewData: result.interviewData,
          success: true,
        });
      } else {
        console.error('Interview ended with errors:', result.error);
      }
    } catch (error) {
      console.error('Error ending interview:', error);
    }
  };

  // Handle start interview
  const handleStartInterview = async () => {
    try {
      clearError();
      const success = await startInterview();
      if (success) {
        setInterviewStarted(true);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = () => {
    switch (interviewStatus) {
      case 'connecting':
        return 'secondary';
      case 'active':
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
    switch (interviewStatus) {
      case 'idle':
        return 'Ready to start';
      case 'connecting':
        return 'Connecting...';
      case 'active':
        return 'Interview in progress';
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
              <CardTitle className="text-2xl">Voice Interview</CardTitle>
              <p className="text-muted-foreground">
                {interviewConfig.position} - {interviewConfig.interviewType}
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
                disabled={interviewStatus === 'connecting'}
                className="flex items-center gap-2"
              >
                {interviewStatus === 'connecting' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Interview
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

                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm text-red-600">Recording</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleEndInterview}
                  variant="destructive"
                  disabled={interviewStatus === 'ending'}
                  className="flex items-center gap-2"
                >
                  {interviewStatus === 'ending' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  End Interview
                </Button>

                <Button onClick={onInterviewCancel} variant="outline">
                  Cancel
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
                  Questions Asked
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
                      {message.role === 'user' ? 'You' : 'Interviewer'}
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
      {interviewStarted && isConnected && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Interview Instructions</h3>
              <p className="text-sm text-muted-foreground">
                Speak clearly into your microphone. The AI interviewer will ask
                questions and you can respond naturally. The conversation is
                being recorded and transcribed.
              </p>
              <p className="text-xs text-muted-foreground">
                Language:{' '}
                {interviewConfig.language === 'hindi' ? 'Hindi' : 'English'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
