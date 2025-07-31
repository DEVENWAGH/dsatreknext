'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import voiceInterviewService from '@/services/voiceInterviewService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  ArrowLeft,
  BarChart2,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';


export default function StartInterviewPage() {
  const { interviewId } = useParams();
  const router = useRouter();

  // Interview state
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Voice interview state
  const [isVoiceInitialized, setIsVoiceInitialized] = useState(false);
  const [vapi, setVapi] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestion] = useState(0);
  const [responses] = useState([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [progress] = useState(0);
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volumeLevel] = useState(0);
  const [currentQuestionText] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  const { getInterviewById, getInterviewFromCache, updateInterviewStatus } =
    useInterviewStore();

  // Helper function to get questions consistently
  const getQuestions = interviewData => {
    if (!interviewData) return [];

    const questions =
      interviewData.questions ||
      interviewData.generatedQuestions ||
      interviewData.questionsList ||
      [];

    return Array.isArray(questions) ? questions : [];
  };

  // Handle ending interview
  const handleInterviewEnd = useCallback(
    async (finalResponses = null) => {
      try {
        const interviewResponses = finalResponses || responses;

        // Update interview status to completed
        await updateInterviewStatus(interviewId, {
          status: 'completed',
          responses: interviewResponses,
          completedAt: new Date().toISOString(),
          duration: elapsedTime,
        });

        toast.success('Interview completed successfully!');

        // Navigate to interview details to show results
        setTimeout(() => {
          router.push(`/interview-details/${interviewId}`);
        }, 2000);
      } catch (error) {
        toast.error('Error saving interview results');
      }
    },
    [responses, updateInterviewStatus, interviewId, elapsedTime, router]
  );

  // Timer effect for elapsed time
  useEffect(() => {
    let interval;
    if (isInterviewActive && interviewStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - interviewStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewActive, interviewStartTime]);

  // Initialize Vapi
  useEffect(() => {
    const initVapi = async () => {
      if (vapi || isVoiceInitialized) return;

      try {
        // Dynamic import with better error handling for production
        const VapiModule = await import('@vapi-ai/web').catch(err => {
          console.error('Failed to import @vapi-ai/web:', err);
          throw new Error('Vapi module not available');
        });
        
        let Vapi;
        
        // Handle different export formats in dev vs production
        if (VapiModule.default) {
          // In production, default might be wrapped
          if (typeof VapiModule.default === 'function') {
            Vapi = VapiModule.default;
          } else if (VapiModule.default.default && typeof VapiModule.default.default === 'function') {
            Vapi = VapiModule.default.default;
          } else if (VapiModule.default.Vapi && typeof VapiModule.default.Vapi === 'function') {
            Vapi = VapiModule.default.Vapi;
          }
        } else if (VapiModule.Vapi && typeof VapiModule.Vapi === 'function') {
          Vapi = VapiModule.Vapi;
        } else if (typeof VapiModule === 'function') {
          Vapi = VapiModule;
        }
        
        const vapiApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;

        if (!vapiApiKey) {
          console.warn('VAPI API key not configured');
          setIsVoiceInitialized(false);
          return;
        }

        if (typeof Vapi !== 'function') {
          console.error('Vapi is not a constructor. Available exports:', Object.keys(VapiModule));
          console.error('Default export type:', typeof VapiModule.default);
          console.error('Default export keys:', VapiModule.default ? Object.keys(VapiModule.default) : 'none');
          setIsVoiceInitialized(false);
          return;
        }

        const vapiInstance = new Vapi(vapiApiKey);
        setVapi(vapiInstance);
        setIsVoiceInitialized(true);

        vapiInstance.on('call-start', () => {
          setIsConnected(true);
          setIsInterviewActive(true);
          setInterviewStartTime(new Date());
        });

        vapiInstance.on('call-end', () => {
          setIsConnected(false);
          setIsAISpeaking(false);
          setIsInterviewActive(false);
          setElapsedTime(0);
        });

        vapiInstance.on('speech-start', () => {
          setIsAISpeaking(true);
        });

        vapiInstance.on('speech-end', () => {
          setIsAISpeaking(false);
        });

        vapiInstance.on('error', error => {
          setIsConnected(false);
          setIsAISpeaking(false);
          setIsInterviewActive(false);
        });
      } catch (err) {
        console.error('Failed to initialize Vapi:', err);
        setIsVoiceInitialized(false);
      }
    };

    initVapi();

    return () => {
      if (vapi) {
        try {
          vapi.stop();
        } catch (e) {
          // Silent error handling
        }
      }
    };
  }, []);

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) {
        setError('No interview ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // First try to get from cache
        const cachedInterview = getInterviewFromCache(interviewId);
        if (cachedInterview) {
          setInterview(cachedInterview);
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        const fetchedInterview = await getInterviewById(interviewId);

        if (fetchedInterview) {
          setInterview(fetchedInterview);
        } else {
          setError('Interview not found');
        }
      } catch (error) {
        setError(`Failed to load interview data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId, getInterviewById, getInterviewFromCache]);

  // Handle starting voice interview (based on Vite Meeting.jsx)
  const handleStartVoiceInterview = async () => {
    if (!vapi) {
      setError('Interview system is not initialized. Please refresh the page.');
      toast.error('Voice service not initialized');
      return;
    }

    if (!interview) {
      setError('Interview data is not available. Please try again.');
      toast.error('Interview data not loaded');
      return;
    }

    const questions = getQuestions(interview);
    if (!questions || questions.length === 0) {
      toast.error('No questions available for this interview');
      return;
    }

    try {
      console.log('🎙️ Starting voice interview...');
      setError(null);

      // Create question list
      let questionList = questions
        .map(q => (typeof q === 'string' ? q : q.question))
        .join(', ');

      const jobPosition =
        interview.position || interview.jobPosition || 'position';
      const interviewType = interview.interviewType || 'interview';
      const difficulty =
        interview.difficulty || interview.interviewDifficulty || 'medium';
      const duration = interview.duration || '15 minutes';

      const assistantOptions = {
        name: 'AI Interviewer',
        firstMessage: `Hi there! I'm AI Interviewer, I'm excited to conduct your interview for the ${jobPosition} position. Are you ready to begin?`,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: `You are AI Interviewer, a professional and friendly AI interviewer conducting interviews for a ${jobPosition} position.
                        Your personality is warm, encouraging, and professional. You speak with confidence and clarity.
                        Your job is to ask candidates the provided interview questions and assess their responses thoughtfully.
                        Begin the conversation with enthusiasm and create a comfortable environment for the candidate.
                        Ask one question at a time and listen carefully to their responses before proceeding.
                        Keep your questions clear, concise, and well-articulated. Below are the questions to ask systematically:
                        Questions: ${questionList}
                        
                        Interview Details:
                        - Position: ${jobPosition}
                        - Type: ${interviewType}
                        - Difficulty: ${difficulty}
                        - Duration: ${duration}
                        
                        IMPORTANT GUIDELINES:
                        - NEVER end the call prematurely
                        - Continue the conversation naturally until all questions are asked
                        - If you encounter any technical issues, continue the interview
                        - Do not use phrases that might trigger call termination
                        - Keep the interview flowing smoothly without interruption
                        - Focus on creating a positive interview experience
                        
                        If the candidate struggles, offer hints or rephrase the question without giving away the answer.
                        Provide brief, encouraging feedback after each answer.
                        Keep the conversation natural and engaging.
                        After all questions, wrap up the interview smoothly by summarizing their performance.
                        End on a positive note by saying "Thank you for your time today. This concludes our interview."
                        
                        Key Guidelines for AI Interviewer:
                        - Maintain a warm, professional, and encouraging demeanor
                        - Speak clearly with a confident voice
                        - Keep responses conversational yet structured
                        - Show genuine interest in the candidate's answers
                        - Provide constructive and motivating feedback
                        - Adapt your tone based on the candidate's comfort level
                        - Focus on both technical competency and cultural fit
                        - Celebrate good answers and gently guide when needed
                        - Ask thoughtful follow-up questions to dive deeper
                        - End with genuine appreciation for their time and effort`,
            },
          ],
        },
        voice: {
          provider: '11labs',
          voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - Natural male voice suitable for Indian English
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en-IN',
        },
        endCallPhrases: [
          // Remove potentially problematic phrases that might trigger early termination
          'interview completed successfully',
          'thank you and goodbye',
        ],
      };

      console.log('📋 Starting Vapi call with assistant options:', {
        name: assistantOptions.name,
        questionCount: questions.length,
        hasQuestions: questionList.length > 0,
      });

      await vapi.start(assistantOptions);
      console.log('✅ Voice interview call started successfully');
    } catch (error) {
      console.error('❌ Failed to start voice interview:', error);
      toast.error(
        `Failed to start interview: ${error.message || 'Unknown error'}`
      );
      setError(error.message || 'Failed to start interview');
    }
  };

  // Handle stopping interview
  const handleStopInterview = () => {
    if (voiceInterviewService.isActive()) {
      voiceInterviewService.stop();
    }
    setIsInterviewActive(false);
    setIsConnected(false);
    handleInterviewEnd();
  };

  // Toggle mute
  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    voiceInterviewService.setMuted(newMutedState);
    toast.info(newMutedState ? 'Microphone muted' : 'Microphone unmuted');
  };

  // Handle go back
  const handleGoBack = () => {
    if (isInterviewActive) {
      if (
        confirm('Are you sure you want to leave? This will end the interview.')
      ) {
        handleStopInterview();
        router.push(`/interview-details/${interviewId}`);
      }
    } else {
      router.push(`/interview-details/${interviewId}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Unable to Start Interview
          </h2>
          <p className="text-muted-foreground">
            {error || 'Interview not found'}
          </p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Main Video Area */}
        <div className="flex-1 p-2">
          <Card className="h-full flex items-center justify-center relative overflow-hidden">
            {!isInterviewActive && (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                  <div className="text-center lg:text-left space-y-4 relative">
                    <div className="lg:hidden mb-6">
                      <Avatar className="w-24 h-24 mx-auto">
                        <AvatarImage
                          src="/user.png"
                          alt="AI Interviewer"
                        />
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="w-12 h-12 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <Badge
                          variant="secondary"
                          className="px-2 py-0.5 text-xs"
                        >
                          AI Interviewer
                        </Badge>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold">
                      Ready to start your interview?
                    </h2>
                    <p className="text-muted-foreground">
                      Position: {interview.position}
                    </p>
                    <p className="text-muted-foreground">
                      Type: {interview.interviewType}
                    </p>
                    <Button
                      onClick={handleStartVoiceInterview}
                      disabled={!isVoiceInitialized || !interview}
                      size="lg"
                      className="px-6"
                    >
                      {!isVoiceInitialized ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        'Start Interview'
                      )}
                    </Button>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-64 h-64 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                      <img src="/user.png" alt="User" className="w-32 h-32 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isInterviewActive && (
              <>
                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'flex items-center gap-1 px-2 py-0.5 text-xs',
                      isAISpeaking && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isAISpeaking
                          ? 'bg-primary-foreground animate-pulse'
                          : 'bg-primary'
                      )}
                    />
                    {isAISpeaking
                      ? 'AI Interviewer Speaking...'
                      : 'Listening...'}
                  </Badge>
                </div>

                <div className="text-center space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="/user.png" alt="AI Interviewer" />
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="w-10 h-10 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">AI Interviewer</h3>
                      <p className="text-sm text-muted-foreground">
                        Interview in progress
                      </p>
                    </div>
                  </div>

                  {/* Current Question Display */}
                  {currentQuestionText && (
                    <Card className="max-w-2xl mx-auto p-4">
                      <p className="text-lg leading-relaxed text-center">
                        {currentQuestionText}
                      </p>
                      <div className="mt-2 text-sm text-muted-foreground text-center">
                        Question {currentQuestion + 1} of{' '}
                        {getQuestions(interview).length || 0}
                      </div>
                      <Progress value={progress || 0} className="w-full mt-3" />
                    </Card>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <Card className="w-64 border-l rounded-none hidden lg:block">
          <div className="p-2 space-y-2">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-semibold">Interview Status</h3>
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Status Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <span className="text-sm">Connection:</span>
                <Badge
                  className={
                    isConnected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <span className="text-sm">Microphone:</span>
                <Badge
                  className={
                    isMuted
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }
                >
                  {isMuted ? 'Muted' : 'Active'}
                </Badge>
              </div>

              {volumeLevel > 0 && (
                <div className="p-2 rounded-lg bg-muted">
                  <div className="space-y-1">
                    <span className="text-sm">Voice Level:</span>
                    <Progress
                      value={(volumeLevel || 0) * 100}
                      className="w-full h-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Interview Details */}
            <div className="pt-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-semibold">Details</h3>
              </div>
              <div className="space-y-1 text-xs">
                <div className="p-2 rounded-lg bg-muted">
                  <div className="font-medium">
                    Duration: {interview.duration}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <div className="font-medium">
                    Questions: {getQuestions(interview).length || 0}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <div className="font-medium">
                    Type: {interview.interviewType}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <div className="font-medium capitalize">
                    Difficulty: {interview.difficulty}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="rounded-none border-x-0 border-b-0 h-16">
        <div className="flex items-center justify-center h-full space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'rounded-full h-10 w-10',
              isMuted &&
                'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
            onClick={handleToggleMute}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleStopInterview}
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50">
          <Badge variant="destructive" className="px-3 py-1 text-xs">
            {error}
          </Badge>
        </div>
      )}
    </div>
  );
}
