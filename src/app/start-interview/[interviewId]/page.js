'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
<<<<<<< HEAD
import voiceInterviewService from '@/services/voiceInterviewService';
=======
>>>>>>> voice
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  PhoneOff,
  ArrowLeft,
  BarChart2,
  Bot,
  Volume2,
  VolumeX,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
<<<<<<< HEAD
=======
import { Ripple } from '@/components/magicui/ripple';
import { useDeepgramVoiceInterview } from '@/hooks/useDeepgramVoiceInterview';
>>>>>>> voice

export default function StartInterviewPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  // Interview state
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

<<<<<<< HEAD
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
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volumeLevel] = useState(0);
  const [currentQuestionText] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
=======
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
>>>>>>> voice

  const { getInterviewById, getInterviewFromCache, updateInterviewStatus } =
    useInterviewStore();

  // Helper function to get questions consistently
  const getQuestions = interviewData => {
    if (!interviewData) return [];

    const questions =
      interviewData.questions ||
      interviewData.generatedQuestions ||
      interviewData.interviewQuestions ||
      [];

    return Array.isArray(questions) ? questions : [];
  };

<<<<<<< HEAD
  // Handle ending interview
  const handleInterviewEnd = useCallback(
    async (finalResponses = null, customFeedback = null) => {
      try {
        const interviewResponses = finalResponses || responses;
        const questions = getQuestions(interview);
        const completionRate = Math.round((elapsedTime / totalDuration) * 100);
        
        // Generate comprehensive feedback
        const feedback = customFeedback || `Interview Summary:
• Position: ${interview.position || 'N/A'}
• Duration: ${formatTime(elapsedTime)} (${completionRate}% of allocated time)
• Questions Prepared: ${questions.length || 0}
• Interview Type: ${interview.interviewType || 'N/A'}
• Difficulty Level: ${interview.difficulty || 'medium'}
• Completion Status: ${completionRate >= 90 ? 'Full completion' : completionRate >= 50 ? 'Partial completion' : 'Early termination'}
• Performance: Interview conducted successfully with AI assistance.`;

        // Update interview status to completed with feedback
        await fetch(`/api/interviews/${interviewId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'completed',
            feedback: feedback
          })
        });

        // Also update via store for consistency
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
    [responses, updateInterviewStatus, interviewId, elapsedTime, router, interview, totalDuration]
  );

=======
>>>>>>> voice
  // Parse duration to seconds
  const parseDurationToSeconds = duration => {
    if (!duration) return 1800; // Default 30 minutes
    if (typeof duration === 'number') return duration;

    const durationStr = duration.toString().toLowerCase();
    if (durationStr.includes('min')) {
      const minutes = parseInt(durationStr.replace(/\D/g, ''));
      return minutes * 60;
    }
    if (durationStr.includes('hour')) {
      const hours = parseInt(durationStr.replace(/\D/g, ''));
      return hours * 3600;
    }

    // Try to parse as number (assume minutes)
    const parsed = parseInt(durationStr);
    return isNaN(parsed) ? 1800 : parsed * 60;
  };

  // Initialize Custom Voice Interview configuration
  const interviewConfig = interview
    ? {
        position:
          interview.position || interview.jobPosition || 'Software Developer',
        interviewType: interview.interviewType || 'Technical Interview',
        language: 'english', // Can be 'hindi' or 'english'
        duration: interview.duration || '30 min',
        difficulty: interview.difficulty || 'medium',
        questions: getQuestions(interview),
        candidateName:
          session?.user?.firstName || session?.user?.name || 'Candidate',
        companyName: interview.companyName || 'Company',
      }
    : null;

<<<<<<< HEAD
  // Timer effect for elapsed time and auto-end
  useEffect(() => {
    let interval;
    if (isInterviewActive && interviewStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - interviewStartTime) / 1000);
        const remaining = Math.max(0, totalDuration - elapsed);

        setElapsedTime(elapsed);
        setRemainingTime(remaining);

        // Auto-end interview when time is up
        if (remaining <= 0 && vapi && isConnected) {
          toast.success('Interview completed! Time is up.');
          // Send final message before ending
          try {
            vapi.send({
              type: 'add-message',
              message: {
                role: 'assistant',
                content:
                  'Thank you for your time today. Your interview duration has been completed. This concludes our interview session. Have a great day!',
              },
            });
            // Wait a moment for the message to be spoken
            setTimeout(() => {
              vapi.stop();
            }, 3000);
          } catch (error) {
            vapi.stop();
          }
          handleInterviewEnd();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [
    isInterviewActive,
    interviewStartTime,
    totalDuration,
    vapi,
=======
  // Use Deepgram Voice Interview Hook
  const {
>>>>>>> voice
    isConnected,
    isListening: isRecording,
    isSpeaking,
    conversation,
    error: voiceError,
    status: interviewStatus,
    startInterview,
    endInterview,
    getTranscript,
    getInterviewStats,
    clearError,
    testMicrophone,
    testConfiguration,
  } = useDeepgramVoiceInterview(interviewConfig);

<<<<<<< HEAD
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
          } else if (
            VapiModule.default.default &&
            typeof VapiModule.default.default === 'function'
          ) {
            Vapi = VapiModule.default.default;
          } else if (
            VapiModule.default.Vapi &&
            typeof VapiModule.default.Vapi === 'function'
          ) {
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
          console.error(
            'Vapi is not a constructor. Available exports:',
            Object.keys(VapiModule)
          );
          console.error('Default export type:', typeof VapiModule.default);
          console.error(
            'Default export keys:',
            VapiModule.default ? Object.keys(VapiModule.default) : 'none'
          );
          setIsVoiceInitialized(false);
          return;
        }

        const vapiInstance = new Vapi(vapiApiKey);
        setVapi(vapiInstance);
        setIsVoiceInitialized(true);

        vapiInstance.on('call-start', () => {
          console.log('✅ Call started - setting up timer');
          setIsConnected(true);
          setIsInterviewActive(true);
          setInterviewStartTime(new Date());
          toast.success('Interview started!');
        });

        vapiInstance.on('call-end', () => {
          setIsConnected(false);
          setIsAISpeaking(false);
          setIsInterviewActive(false);
          setElapsedTime(0);
          setRemainingTime(totalDuration);
          // End interview with voice note
          handleInterviewEnd();
        });

        vapiInstance.on('speech-start', () => {
          setIsAISpeaking(true);
        });

        vapiInstance.on('speech-end', () => {
          setIsAISpeaking(false);
        });

        vapiInstance.on('message', (message) => {
          if (message.type === 'transcript' && message.transcriptType === 'final') {
            const transcript = message.transcript?.toLowerCase() || '';
            const endPhrases = ['goodbye', 'good bye', 'end interview', 'finish interview', 'stop interview', 'thank you', 'that\'s all', 'we\'re done', 'interview complete'];
            
            if (endPhrases.some(phrase => transcript.includes(phrase))) {
              console.log('End phrase detected:', transcript);
              // Generate comprehensive feedback with natural ending note
              setTimeout(async () => {
                try {
                  const questions = getQuestions(interview);
                  const completionRate = Math.round((elapsedTime / totalDuration) * 100);
                  
                  const feedback = `Interview Summary:
• Position: ${interview.position || 'N/A'}
• Duration: ${formatTime(elapsedTime)} (${completionRate}% of allocated time)
• Questions Prepared: ${questions.length || 0}
• Interview Type: ${interview.interviewType || 'N/A'}
• Difficulty Level: ${interview.difficulty || 'medium'}
• Completion Status: Natural completion - User ended with: "${message.transcript}"
• Performance: Interview concluded naturally by candidate.`;
                  
                  await fetch(`/api/interviews/${interviewId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      status: 'completed',
                      feedback: feedback
                    })
                  });
                  
                  toast.success('Interview completed and feedback saved!');
                  vapi.stop();
                } catch (error) {
                  console.error('Error saving feedback:', error);
                  vapi.stop();
                }
              }, 2000);
            }
          }
        });

        vapiInstance.on('error', error => {
          setIsConnected(false);
          setIsAISpeaking(false);
          setIsInterviewActive(false);
        });
      } catch (err) {
        console.error('Failed to initialize Vapi:', err);
        setIsVoiceInitialized(false);
=======
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversation.length > 0) {
      const chatEnd = document.getElementById('chat-end');
      if (chatEnd) {
        chatEnd.scrollIntoView({ behavior: 'smooth' });
>>>>>>> voice
      }
    }
  }, [conversation]);

<<<<<<< HEAD
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
=======
  // Load interview data
>>>>>>> voice
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
          setTotalDuration(parseDurationToSeconds(cachedInterview.duration));
          setRemainingTime(parseDurationToSeconds(cachedInterview.duration));
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        const fetchedInterview = await getInterviewById(interviewId);

        if (fetchedInterview) {
          setInterview(fetchedInterview);
          setTotalDuration(parseDurationToSeconds(fetchedInterview.duration));
          setRemainingTime(parseDurationToSeconds(fetchedInterview.duration));
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

<<<<<<< HEAD
  // Handle starting voice interview (based on Vite Meeting.jsx)
  const handleStartVoiceInterview = async () => {
    if (!vapi) {
      setError('Interview system is not initialized. Please refresh the page.');
      toast.error('Voice service not initialized');
      return;
=======
  // Timer effect
  useEffect(() => {
    let interval;
    if (isConnected && interviewStatus === 'active') {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newElapsed = prev + 1;
          setRemainingTime(Math.max(0, totalDuration - newElapsed));

          // Auto-end interview when time is up
          if (newElapsed >= totalDuration) {
            handleEndInterview();
          }

          return newElapsed;
        });
      }, 1000);
>>>>>>> voice
    }

    return () => clearInterval(interval);
  }, [isConnected, interviewStatus, totalDuration]);

  // Format time helper
  const formatTime = seconds => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start interview handler
  const handleStartInterview = async () => {
    if (!interview) {
      toast.error('Interview data not available');
      return;
    }

    const questions = getQuestions(interview);
    if (!questions || questions.length === 0) {
      toast.error('No questions available for this interview');
      return;
    }

    try {
<<<<<<< HEAD
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
      
      // Get user's name from session
      const userName = session?.user?.firstName 
        ? `${session.user.firstName}${session.user.lastName ? ' ' + session.user.lastName : ''}`
        : session?.user?.name || 'candidate';

      const assistantOptions = {
        name: 'AI Interviewer',
        firstMessage: `Hi ${userName}! I'm your AI interviewer for the ${jobPosition} position. Are you ready to begin?`,
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: `You are conducting an interview for ${jobPosition} with ${userName}. Address them by name throughout the conversation. Ask these questions one by one: ${questionList}. Keep responses brief and professional.`,
            },
          ],
        },
        voice: {
          provider: '11labs',
          voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - Natural male voice
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en-IN',
        },
      };

      console.log('📋 Starting Vapi call with assistant options:', {
        name: assistantOptions.name,
        questionCount: questions.length,
        hasQuestions: questionList.length > 0,
      });

      // Start timer immediately on button click
      const startTime = new Date();
      setIsInterviewActive(true);
      setIsConnected(true);
      setInterviewStartTime(startTime);
      console.log('⏰ Timer started at:', startTime);
      toast.success('Interview started! Timer is running.');

      try {
        await vapi.start(assistantOptions);
        console.log('✅ Voice interview call started successfully');
      } catch (vapiError) {
        console.warn('Vapi failed but continuing with timer:', vapiError);
        // Keep the interview active even if Vapi fails
        toast.warning(
          'Voice service unavailable, but interview timer is running'
        );
      }
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
    if (vapi && isConnected) {
      vapi.stop();
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
=======
      console.log('🎙️ Starting Deepgram voice interview...');
      toast.info('Testing microphone and Deepgram configuration...');

      // Test microphone access first
      const micTest = await testMicrophone();
      if (!micTest) {
        toast.error('Microphone access denied. Please allow microphone access.');
        return;
      }

      // Test configuration
      const configTest = await testConfiguration();
      if (!configTest) {
        toast.error('Deepgram/Gemini configuration error. Please check API keys.');
        return;
      }

      toast.info('Connecting to Deepgram... Please speak clearly.');
      const success = await startInterview();
      
      if (success) {
        toast.success('Connected! The Deepgram AI interviewer will greet you shortly.');
        setElapsedTime(0);
        setRemainingTime(totalDuration);
      } else {
        toast.error('Failed to connect to Deepgram. Please try again.');
      }
    } catch (error) {
      console.error('❌ Failed to start interview:', error);
      toast.error('Error starting Deepgram interview: ' + (error.message || 'Unknown error'));
    }
  };

  // End interview handler
  const handleEndInterview = useCallback(async () => {
    try {
      console.log('🛑 Ending interview...');
      toast.info('Ending interview and generating feedback...');

      const result = await endInterview();

      if (result.success) {
        // Generate feedback using conversation data
        const transcript = getTranscript();
        const stats = getInterviewStats();

        try {
          const feedbackResponse = await fetch('/api/generate-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              position: interview.position || 'Software Developer',
              duration: interview.duration || '30 min',
              completionRate: Math.round((elapsedTime / totalDuration) * 100),
              interviewType: interview.interviewType || 'Technical Interview',
              difficulty: interview.difficulty || 'medium',
              questionsCount: getQuestions(interview).length,
              transcript: transcript,
              stats: stats,
              interviewId: interviewId,
            }),
          });

          let feedback = null;
          if (feedbackResponse.ok) {
            const feedbackData = await feedbackResponse.json();
            feedback = feedbackData.feedback;
            console.log('✅ AI feedback generated successfully');
          } else {
            console.error('❌ Feedback generation failed');
            feedback = `Interview completed for ${interview.position}. Duration: ${formatTime(elapsedTime)}. Total responses: ${stats.candidateResponses}.`;
          }

          // Update interview status
          await updateInterviewStatus(interviewId, 'completed', {
            feedback,
            transcript,
            stats,
            duration: elapsedTime,
            conversation: conversation,
          });

          setFeedbackSaved(true);
          toast.success('Interview completed! Feedback has been generated.');
        } catch (error) {
          console.error('❌ Error generating feedback:', error);
          toast.error('Interview completed but feedback generation failed');
        }
      } else {
        toast.error('Error ending interview properly');
      }
    } catch (error) {
      console.error('❌ Error in handleEndInterview:', error);
      toast.error('Error ending interview');
    }
  }, [
    endInterview,
    interview,
    elapsedTime,
    totalDuration,
    interviewId,
    conversation,
    updateInterviewStatus,
    getTranscript,
    getInterviewStats,
  ]);
>>>>>>> voice

  // Handle go back
  const handleGoBack = () => {
    if (isConnected || interviewStatus === 'active') {
      if (
        confirm('Are you sure you want to leave? This will end the interview.')
      ) {
        handleEndInterview();
        router.push(`/interview-details/${interviewId}`);
      }
    } else {
      router.push(`/interview-details/${interviewId}`);
    }
  };

  // Clear voice errors
  useEffect(() => {
<<<<<<< HEAD
    const handlePageExit = () => {
      if (isInterviewActive) {
        console.log('🛑 Page exit detected - stopping interview');
        if (vapi) {
          try {
            vapi.stop();
          } catch (e) {}
        }
        setIsInterviewActive(false);
        setIsConnected(false);
      }
    };

    // Multiple event listeners for different exit scenarios
    window.addEventListener('beforeunload', handlePageExit);
    window.addEventListener('pagehide', handlePageExit);

    // Visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden && isInterviewActive) {
        console.log('🛑 Tab hidden - stopping interview');
        handlePageExit();
        toast.info('Interview ended - tab was switched');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('pagehide', handlePageExit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInterviewActive, vapi]);
=======
    if (voiceError) {
      setError(voiceError);
      setTimeout(() => {
        clearError();
        setError(null);
      }, 5000);
    }
  }, [voiceError, clearError]);
>>>>>>> voice

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="h-4 w-px bg-border" />
              <div>
                <h1 className="font-semibold text-lg">{interview.position}</h1>
                <p className="text-sm text-muted-foreground">{interview.interviewType}</p>
              </div>
            </div>
            {interviewStatus === 'active' && (
              <div className={`flex items-center gap-2 px-3 py-1 text-sm font-mono rounded-md font-medium ${
                remainingTime <= 60 ? 'bg-destructive text-destructive-foreground' : 
                remainingTime <= 300 ? 'bg-primary text-primary-foreground' : 
                'bg-secondary text-secondary-foreground'
              }`}>
                <BarChart2 className="w-4 h-4" />
                {formatTime(remainingTime)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Main Interview Area */}
        <div className="flex-1 p-4 lg:p-6">
          <Card className="h-full flex items-center justify-center relative overflow-hidden border-2">
            {(interviewStatus === 'idle' || !isConnected) && (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center space-y-8 max-w-md">
                  <div className="relative">
                    <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Bot className="w-20 h-20 text-primary" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground rounded-md">
                        🤖 AI Interviewer
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">
                      {feedbackSaved ? 'Ready for a new interview?' : 'Ready to start your interview?'}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="font-medium text-muted-foreground">Position</div>
                        <div className="font-semibold">{interview.position}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="font-medium text-muted-foreground">Duration</div>
                        <div className="font-semibold">{formatTime(totalDuration)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      AI-powered voice interview • Speak naturally
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleStartInterview}
                      disabled={loading || !interview}
                      size="lg"
                      className="w-full py-6 text-lg font-semibold"
                    >
                      {feedbackSaved ? '🎯 Start New Interview' : '🎙️ Start Interview'}
                    </Button>
<<<<<<< HEAD
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-64 h-64 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                      <Image
                        src="/user.png"
                        alt="User"
                        className="w-32 h-32 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Always show timer when interview is active */}
            {isInterviewActive && (
              <div className="absolute top-2 right-2 z-50">
                <Badge
                  variant={
                    remainingTime <= 60
                      ? 'destructive'
                      : remainingTime <= 300
                        ? 'default'
                        : 'secondary'
                  }
                  className={`flex items-center gap-1 px-3 py-1 text-lg font-mono transition-all duration-300 ${
                    remainingTime <= 60 ? 'animate-pulse' : ''
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  {formatTime(remainingTime)}
                </Badge>
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
=======
                    {feedbackSaved && (
                      <Button
                        onClick={() => router.push(`/interview-details/${interviewId}`)}
                        variant="outline"
                        size="lg"
                        className="w-full py-3"
                      >
                        📊 View Results
                      </Button>
>>>>>>> voice
                    )}
                  </div>
<<<<<<< HEAD
                )}

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
=======
>>>>>>> voice
                </div>
              </div>
            )}

            {(interviewStatus === 'connecting' || interviewStatus === 'active' || isConnected) && (
              <div className="h-full flex flex-col p-4">
                {/* AI Status Header */}
                <div className="flex items-center justify-center gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      {(isRecording || isConnected) && (
                        <Ripple
                          mainCircleSize={60}
                          numCircles={isRecording ? 4 : 2}
                          className={isRecording ? 'text-green-500' : 'text-primary'}
                        />
                      )}
                      <Bot className={cn('w-8 h-8 z-10', isRecording ? 'text-green-500' : 'text-primary')} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold">🤖 AI Interviewer</h3>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', 
                        isRecording ? 'bg-green-500 animate-pulse' : 
                        isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                      )} />
                      <span className="text-sm">
                        {isRecording ? '👂 Listening...' : isSpeaking ? '🗣️ Speaking...' : '⏳ Ready'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Interview Chat
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {conversation.length} messages
                    </span>
                  </div>
                  
                  <div className="flex-1 bg-muted/20 rounded-lg border overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-3 space-y-3" id="chat-container">
                      {conversation.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Conversation will appear here...</p>
                          <p className="text-xs mt-2">Start speaking to begin the interview</p>
                        </div>
                      ) : (
                        <>
                          {conversation.map((msg, index) => (
                            <div key={`${msg.timestamp}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                              <div className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                                msg.role === 'user' 
                                  ? 'bg-primary text-primary-foreground ml-4' 
                                  : 'bg-background border border-border mr-4'
                              }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium">
                                    {msg.role === 'user' ? '👤 You' : '🤖 AI Interviewer'}
                                  </span>
                                  <span className="text-xs opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {msg.content}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div id="chat-end" />
                        </>
                      )}
                    </div>
                    
                    {/* Live Status Bar */}
                    <div className="border-t bg-background/50 p-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {isRecording && (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-red-600 font-medium">Recording...</span>
                            </>
                          )}
                          {isSpeaking && (
                            <>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              <span className="text-blue-600 font-medium">AI Speaking...</span>
                            </>
                          )}
                          {!isRecording && !isSpeaking && isConnected && (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-green-600 font-medium">Ready to listen</span>
                            </>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          💡 You can interrupt anytime
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


          </Card>
        </div>

        {/* Compact Side Panel */}
        <Card className="w-72 rounded-none border-l-0 hidden lg:block">
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Status & Details</h3>
            </div>

            {/* Compact Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full', isConnected ? 'bg-green-500' : 'bg-gray-400')} />
                  <span className="text-xs">Connection</span>
                </div>
                <span className="text-xs font-medium">{isConnected ? '✓ Connected' : '✗ Disconnected'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full', isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400')} />
                  <span className="text-xs">Recording</span>
                </div>
                <span className="text-xs font-medium">{isRecording ? '🔴 Active' : '⚫ Inactive'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full', 
                    interviewStatus === 'active' ? 'bg-blue-500' : 
                    interviewStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                  )} />
                  <span className="text-xs">Status</span>
                </div>
                <span className="text-xs font-medium capitalize">{interviewStatus}</span>
              </div>
            </div>

            {/* Interview Info */}
            <div className="space-y-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-primary/5">
                  <div className="font-medium text-primary">Duration</div>
                  <div className="text-muted-foreground">{interview.duration}</div>
                  {interviewStatus === 'active' && (
                    <div className={cn('text-xs font-medium mt-1',
                      remainingTime <= 60 ? 'text-red-500' : 'text-muted-foreground'
                    )}>
                      {formatTime(remainingTime)} left
                    </div>
                  )}
                </div>
                
                <div className="p-2 rounded bg-muted/30">
                  <div className="font-medium">Questions</div>
                  <div className="text-muted-foreground">{getQuestions(interview).length || 0}</div>
                </div>
              </div>
              
              <div className="p-2 rounded bg-muted/30 text-xs">
                <div className="font-medium mb-1">{interview.interviewType}</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground capitalize">Difficulty: {interview.difficulty}</span>
                  <span className="text-muted-foreground">Messages: {conversation.length}</span>
                </div>
              </div>
            </div>

            {/* Voice Tips */}
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">💡 Voice Tips</div>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Speak clearly and naturally</li>
                <li>• You can interrupt the AI anytime</li>
                <li>• Pause briefly between thoughts</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile Status Bar */}
      <div className="lg:hidden border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-gray-400')} />
                <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-400')} />
                <span className="text-xs">{isRecording ? 'Recording' : 'Idle'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded border">
                {conversation.length} msgs
              </span>
              {interviewStatus === 'active' && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  remainingTime <= 60 ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {formatTime(remainingTime)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            {interviewStatus === 'active' ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGoBack}
                  className="px-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Leave Interview
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndInterview}
                  className="px-8 py-3 text-lg font-semibold"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Interview
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={handleGoBack}
                className="px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Details
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50">
          <div className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded-md font-medium">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
