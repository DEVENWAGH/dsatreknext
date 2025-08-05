'use client';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import jarvisVoiceService from '@/services/jarvisVoiceService';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Ripple } from '@/components/magicui/ripple';

export default function StartInterviewPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  // Speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Interview state
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Voice interview state
  const [isVoiceInitialized, setIsVoiceInitialized] = useState(false);
  const [jarvis, setJarvis] = useState(null);
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
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [interviewTranscript, setInterviewTranscript] = useState([]);

  const { getInterviewById, getInterviewFromCache, updateInterviewStatus } =
    useInterviewStore();

  // Enhanced voice states with real-time feedback
  const [isListeningActive, setIsListeningActive] = useState(false);
  const [isSoundDetected, setIsSoundDetected] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [speechProcessingState, setSpeechProcessingState] = useState('idle'); // idle, listening, processing, responding

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
    async (finalResponses = null, customFeedback = null) => {
      if (feedbackSaved) return; // Prevent duplicate saves
      setFeedbackSaved(true);

      try {
        const interviewResponses = finalResponses || responses;
        const questions = getQuestions(interview);
        const completionRate = Math.round((elapsedTime / totalDuration) * 100);

        // Generate AI-based feedback
        let feedback = customFeedback;
        if (!feedback) {
          try {
            console.log(
              '🤖 Generating AI feedback with transcript entries:',
              interviewTranscript.length
            );

            const feedbackResponse = await fetch('/api/generate-feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                position: interview?.position || 'N/A',
                duration: formatTime(elapsedTime),
                completionRate,
                interviewType: interview?.interviewType || 'N/A',
                difficulty: interview?.difficulty || 'medium',
                questionsCount: questions.length || 0,
                transcript: interviewTranscript,
                interviewId: interviewId,
                language: 'en-IN', // Added language context
              }),
            });

            if (feedbackResponse.ok) {
              const feedbackData = await feedbackResponse.json();
              feedback = feedbackData.feedback;
              console.log('✅ AI feedback generated successfully');
            } else {
              throw new Error('Feedback generation failed');
            }
          } catch (error) {
            console.error('❌ AI feedback generation failed:', error);
            feedback = `Interview completed for ${interview?.position || 'position'}. Duration: ${formatTime(elapsedTime)}. The candidate participated in a ${interview?.interviewType || 'interview'} session using Indian English.`;
          }
        }

        console.log('💾 Saving feedback to interview record...');

        // Update interview status to completed with feedback
        const response = await fetch(`/api/interviews/${interviewId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            feedback: feedback,
            transcript: interviewTranscript,
          }),
        });

        if (response.ok) {
          console.log('✅ Interview completed and feedback saved');
          toast.success(
            'Interview completed and feedback saved! You can start a new interview anytime.'
          );
        } else {
          console.error('❌ Failed to save feedback');
          toast.error('Interview completed but feedback save failed');
        }

        // Also update via store for consistency
        try {
          await updateInterviewStatus(interviewId, {
            status: 'completed',
            responses: interviewResponses,
            completedAt: new Date().toISOString(),
            duration: elapsedTime,
          });
        } catch (storeError) {
          console.error('Store update failed:', storeError);
        }

        // Don't navigate immediately, let user decide
        toast.success(
          'Interview completed! You can view results or start a new interview.',
          {
            duration: 5000,
          }
        );
      } catch (error) {
        console.error('❌ Error in handleInterviewEnd:', error);
        toast.error('Error saving interview results');
      }
    },
    [
      responses,
      updateInterviewStatus,
      interviewId,
      elapsedTime,
      interview,
      totalDuration,
      feedbackSaved,
      interviewTranscript,
    ]
  );

  // Parse duration to seconds with better handling
  const parseDurationToSeconds = duration => {
    if (!duration) return 1800; // Default 30 minutes

    // Handle duration in different formats
    if (typeof duration === 'number') return duration;

    const durationStr = duration.toString().toLowerCase();

    // Check for common formats
    if (durationStr.includes('minute') || durationStr.includes('min')) {
      const match = durationStr.match(/(\d+)\s*(?:minute|min)/i);
      if (match) {
        return parseInt(match[1]) * 60;
      }
    }

    if (durationStr.includes('hour') || durationStr.includes('hr')) {
      const match = durationStr.match(/(\d+)\s*(?:hour|hr)/i);
      if (match) {
        return parseInt(match[1]) * 3600;
      }
    }

    // If it's just a number, treat as minutes
    const numMatch = durationStr.match(/^\d+$/);
    if (numMatch) {
      const minutes = parseInt(numMatch[0]);
      return minutes * 60; // Convert minutes to seconds
    }

    return 1800; // Default 30 minutes
  };

  // Format time display with proper formatting
  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Set total duration when interview loads
  useEffect(() => {
    if (interview?.duration) {
      const duration = parseDurationToSeconds(interview.duration);
      setTotalDuration(duration);
      setRemainingTime(duration);
    }
  }, [interview]);

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
        if (remaining <= 0 && isInterviewActive) {
          console.log('⏰ Time up - ending interview');
          toast.success('Interview completed! Time is up.');
          setIsInterviewActive(false);
          if (jarvis && isConnected) {
            try {
              jarvis.stop();
            } catch (error) {
              console.error('Error stopping jarvis:', error);
            }
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
    jarvis,
    isConnected,
    handleInterviewEnd,
  ]);

  // Initialize Jarvis with enhanced callbacks
  useEffect(() => {
    const initJarvis = async () => {
      if (jarvis || isVoiceInitialized) return;

      try {
        const jarvisInstance = jarvisVoiceService;
        setJarvis(jarvisInstance);
        setIsVoiceInitialized(true);

        // Enhanced event listeners with real-time feedback
        jarvisInstance.onTranscript = (transcript, role) => {
          const transcriptEntry = {
            role: role || 'user',
            text: transcript,
            timestamp: new Date().toISOString(),
          };
          console.log('📝 Recording transcript:', transcriptEntry);
          setInterviewTranscript(prev => {
            const updated = [...prev, transcriptEntry];
            console.log('📋 Total transcript entries:', updated.length);
            return updated;
          });

          // Clear live transcript when final transcript is received
          if (role === 'user') {
            setLiveTranscript('');
            setInterimTranscript('');
            setSpeechProcessingState('processing');
          }

          // Check for end phrases
          const text = transcript?.toLowerCase() || '';
          const endPhrases = [
            'goodbye',
            'good bye',
            'end interview',
            'finish interview',
            'stop interview',
            'thank you for your time',
            "that's all",
            "we're done",
            'interview complete',
            "i'm done",
            'that concludes',
            'end this',
          ];

          const foundPhrase = endPhrases.find(phrase => text.includes(phrase));
          if (foundPhrase) {
            console.log('✅ End phrase detected:', foundPhrase, 'in:', text);
            setTimeout(() => {
              jarvisInstance.stop();
              handleInterviewEnd();
            }, 2000);
          }
        };

        // Real-time interim transcript handling
        jarvisInstance.onInterimTranscript = ({ transcript, confidence }) => {
          setInterimTranscript(transcript);
          setConfidenceLevel(confidence || 0.8);
          setSpeechProcessingState('listening');
          console.log(
            '🎤 Live transcript:',
            transcript,
            'Confidence:',
            confidence
          );
        };

        // Audio detection callbacks for immediate user feedback
        jarvisInstance.onAudioStart = () => {
          setIsListeningActive(true);
          setSpeechProcessingState('listening');
          console.log('🎧 Microphone activated');
        };

        jarvisInstance.onSoundStart = () => {
          setIsSoundDetected(true);
          setSpeechProcessingState('listening');
          console.log('🗣️ User speaking detected');
        };

        jarvisInstance.onSoundEnd = () => {
          setIsSoundDetected(false);
          setSpeechProcessingState('processing');
          console.log('🤫 User stopped speaking');
        };

        jarvisInstance.onSpeechStart = () => {
          setIsAISpeaking(true);
          setSpeechProcessingState('responding');
          setInterimTranscript('');
        };

        jarvisInstance.onSpeechEnd = () => {
          setIsAISpeaking(false);
          setSpeechProcessingState('listening');
        };

        jarvisInstance.onError = error => {
          console.log('Jarvis error - saving feedback:', error);
          setIsConnected(false);
          setIsAISpeaking(false);
          setIsInterviewActive(false);
          handleInterviewEnd();
        };
      } catch (err) {
        console.error('Failed to initialize Jarvis:', err);
        setIsVoiceInitialized(false);
      }
    };

    initJarvis();

    return () => {
      if (jarvis) {
        try {
          jarvis.stop();
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

  // Handle starting voice interview
  const handleStartVoiceInterview = async () => {
    if (!jarvis) {
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

      // Check if browser supports speech recognition
      if (!browserSupportsSpeechRecognition) {
        toast.error(
          'Speech recognition not supported in this browser. Please use Chrome or Edge.'
        );
        setError('Speech recognition not supported in this browser');
        return;
      }

      const jobPosition =
        interview.position || interview.jobPosition || 'position';
      const userName = session?.user?.firstName
        ? `${session.user.firstName}${session.user.lastName ? ' ' + session.user.lastName : ''}`
        : session?.user?.name || 'candidate';

      // Start timer immediately
      const startTime = new Date();
      setIsInterviewActive(true);
      setIsConnected(true);
      setInterviewStartTime(startTime);
      console.log('⏰ Timer started at:', startTime);
      toast.success('Interview started! Timer is running.');

      // Initialize Jarvis (will handle microphone internally)
      try {
        await jarvis.initialize();
        console.log('🎤 Jarvis initialized successfully');
      } catch (initError) {
        console.error('🎤 Jarvis initialization failed:', initError);
        toast.error(
          'Voice system initialization failed. Please try refreshing the page.'
        );
        setError('Voice system initialization failed');
        return;
      }

      // Start Jarvis voice interview
      await jarvis.startInterview({
        position: jobPosition,
        candidateName: userName,
        questions: questions.map(q => (typeof q === 'string' ? q : q.question)),
        sessionId: interviewId,
      });

      console.log('✅ Voice interview started successfully');
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
    if (jarvis && isConnected) {
      jarvis.stop();
    }
    setIsInterviewActive(false);
    setIsConnected(false);
    handleInterviewEnd();
  };

  // Toggle mute
  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (jarvis) {
      jarvis.setMuted(newMutedState);
    }
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

  // Handle page exit - simple and reliable
  useEffect(() => {
    const handlePageExit = () => {
      if (isInterviewActive) {
        console.log('🛑 Page exit detected - stopping interview');
        if (jarvis) {
          try {
            jarvis.stop();
          } catch (e) {}
        }
        setIsInterviewActive(false);
        setIsConnected(false);
      }
    };

    // Multiple event listeners for different exit scenarios
    window.addEventListener('beforeunload', handlePageExit);
    window.addEventListener('pagehide', handlePageExit);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('pagehide', handlePageExit);
    };
  }, [isInterviewActive, jarvis]);

  // Handle transcript from react-speech-recognition with debouncing (Enhanced for Indian English)
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (transcript && isInterviewActive && jarvis && !isProcessingTranscript) {
      const trimmedTranscript = transcript.trim();

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Only process meaningful input (at least 2 words for Indian English, relaxed from 3)
      const wordCount = trimmedTranscript
        .split(' ')
        .filter(word => word.length > 0).length;
      if (wordCount >= 2 && trimmedTranscript.length >= 5) {
        // Increased debounce for 4 seconds to ensure user finished speaking (enhanced for Indian English)
        debounceTimeoutRef.current = setTimeout(() => {
          if (!isProcessingTranscript) {
            setIsProcessingTranscript(true);
            console.log(
              '🎤 PROCESSING SPEECH (en-IN optimized):',
              trimmedTranscript
            );

            // Process the transcript
            const transcriptEntry = {
              role: 'user',
              text: trimmedTranscript,
              timestamp: new Date().toISOString(),
            };

            setInterviewTranscript(prev => {
              const updated = [...prev, transcriptEntry];
              console.log('📋 Total transcript entries:', updated.length);
              return updated;
            });

            // Get AI response with Indian English context
            console.log(
              '🤖 Getting AI response for (en-IN):',
              trimmedTranscript
            );

            // Prepare comprehensive context for Jarvis
            const questions = getQuestions(interview);
            const userName = session?.user?.firstName
              ? `${session.user.firstName}${session.user.lastName ? ' ' + session.user.lastName : ''}`
              : session?.user?.name || 'Candidate';

            const context = {
              position:
                interview?.position ||
                interview?.jobPosition ||
                'Software Developer',
              candidateName: userName,
              interviewType:
                interview?.interviewType || interview?.type || 'technical',
              difficulty: interview?.difficulty || 'medium',
              questions: questions.map(q =>
                typeof q === 'string' ? q : q.question || q
              ),
              duration: interview?.duration || '30 min',
              companyName: interview?.companyName,
              jobDescription: interview?.jobDescription,
              language: 'en-IN', // Added language context for Indian English
            };

            console.log(
              '📤 Sending context to Jarvis with en-IN support:',
              context
            );

            fetch('/api/jarvis/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: trimmedTranscript,
                sessionId: jarvis.sessionId || interviewId,
                context: context,
                interviewData: interview,
                language: 'en-IN', // Specify Indian English support
              }),
            })
              .then(response => {
                console.log('📞 API Response Status:', response.status);
                if (!response.ok) {
                  throw new Error(`API Error: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                console.log('🤖 API Response Data:', data);
                if (data.success && data.response) {
                  // Add AI response to transcript
                  const aiMessage = {
                    role: 'assistant',
                    text: data.response,
                    timestamp: new Date().toISOString(),
                  };

                  setInterviewTranscript(prev => {
                    const updated = [...prev, aiMessage];
                    console.log(
                      '📋 AI response added, total entries:',
                      updated.length
                    );
                    return updated;
                  });

                  jarvis.speak(data.response);
                } else {
                  console.error('No response in data:', data);
                  jarvis.speak(
                    "I'm having trouble understanding. Could you try speaking again? I'm optimized for Indian English."
                  );
                }
              })
              .catch(error => {
                console.error('🚨 API Error:', error);
                jarvis.speak(
                  "I'm having trouble understanding. Could you try speaking again? I'm optimized for Indian English."
                );
              })
              .finally(() => {
                // Reset processing state after 4 seconds for Indian English (increased patience)
                setTimeout(() => {
                  setIsProcessingTranscript(false);
                  resetTranscript();
                }, 4000);
              });
          }
        }, 4000); // Increased to 4 seconds to be more patient with Indian English speakers
      }
    }
  }, [
    transcript,
    isInterviewActive,
    jarvis,
    isProcessingTranscript,
    resetTranscript,
    interviewId,
    interview,
    session,
  ]);

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
                        <AvatarImage src="/user.png" alt="AI Interviewer" />
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="w-12 h-12 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <Badge
                          variant="secondary"
                          className="px-2 py-0.5 text-xs"
                        >
                          AI Interviewer (Indian English Optimized)
                        </Badge>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold">
                      {feedbackSaved
                        ? 'Ready to start a new interview?'
                        : 'Ready to start your interview?'}
                    </h2>
                    <p className="text-muted-foreground">
                      Position: {interview.position}
                    </p>
                    <p className="text-muted-foreground">
                      Type: {interview.interviewType}
                    </p>
                    <p className="text-muted-foreground">
                      Duration: {formatTime(totalDuration)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ✓ Optimized for Indian English • Speak naturally and
                      comfortably
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
                      ) : feedbackSaved ? (
                        'Start New Interview'
                      ) : (
                        'Start Interview'
                      )}
                    </Button>
                    {feedbackSaved && (
                      <Button
                        onClick={() =>
                          router.push(`/interview-details/${interviewId}`)
                        }
                        variant="outline"
                        size="lg"
                        className="px-6 ml-2"
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-64 h-64 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                      <Image
                        src="/user.png"
                        alt="User"
                        width={128}
                        height={128}
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

            {/* Enhanced Status Indicator */}
            {isInterviewActive && (
              <div className="absolute top-2 left-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    'flex items-center gap-2 px-3 py-1 text-sm transition-all duration-300',
                    speechProcessingState === 'listening' &&
                      isSoundDetected &&
                      'bg-green-500 text-white animate-pulse',
                    speechProcessingState === 'processing' &&
                      'bg-yellow-500 text-black',
                    speechProcessingState === 'responding' &&
                      'bg-blue-500 text-white',
                    !isListeningActive && 'bg-gray-500 text-white'
                  )}
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors duration-300',
                      speechProcessingState === 'listening' && isSoundDetected
                        ? 'bg-white animate-pulse'
                        : speechProcessingState === 'processing'
                          ? 'bg-black animate-spin'
                          : speechProcessingState === 'responding'
                            ? 'bg-white'
                            : 'bg-gray-300'
                    )}
                  />
                  {speechProcessingState === 'listening' && isSoundDetected
                    ? 'Listening - You are speaking...'
                    : speechProcessingState === 'processing'
                      ? 'Processing your response...'
                      : speechProcessingState === 'responding'
                        ? 'AI Interviewer speaking...'
                        : isListeningActive
                          ? 'Ready - Waiting for you to speak...'
                          : 'Microphone inactive'}
                </Badge>
              </div>
            )}

            {/* Live Transcript Display */}
            {(interimTranscript || liveTranscript) && (
              <div className="absolute bottom-20 left-4 right-4">
                <Card className="bg-black/80 backdrop-blur-sm text-white border-gray-600">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mt-2" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-300 mb-1">
                          Live Speech Recognition{' '}
                          {confidenceLevel > 0 &&
                            `(${Math.round(confidenceLevel * 100)}% confidence)`}
                        </div>
                        <div className="text-sm font-medium">
                          {interimTranscript || liveTranscript}
                          <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Processing Indicator */}
            {speechProcessingState === 'processing' && !isAISpeaking && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                <Badge
                  variant="default"
                  className="flex items-center gap-2 px-3 py-2 text-sm animate-pulse"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing your response...
                </Badge>
              </div>
            )}

            {isInterviewActive && (
              <>
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

                {/* Enhanced Status Indicator */}
                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'flex items-center gap-2 px-3 py-1 text-sm transition-all duration-300',
                      speechProcessingState === 'listening' &&
                        isSoundDetected &&
                        'bg-green-500 text-white animate-pulse',
                      speechProcessingState === 'processing' &&
                        'bg-yellow-500 text-black',
                      speechProcessingState === 'responding' &&
                        'bg-blue-500 text-white',
                      !isListeningActive && 'bg-gray-500 text-white'
                    )}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors duration-300',
                        speechProcessingState === 'listening' && isSoundDetected
                          ? 'bg-white animate-pulse'
                          : speechProcessingState === 'processing'
                            ? 'bg-black animate-spin'
                            : speechProcessingState === 'responding'
                              ? 'bg-white'
                              : 'bg-gray-300'
                      )}
                    />
                    {speechProcessingState === 'listening' && isSoundDetected
                      ? 'Listening - You are speaking...'
                      : speechProcessingState === 'processing'
                        ? 'Processing your response...'
                        : speechProcessingState === 'responding'
                          ? 'AI Interviewer speaking...'
                          : isListeningActive
                            ? 'Ready - Waiting for you to speak...'
                            : 'Microphone inactive'}
                  </Badge>
                </div>

                {/* Live Transcript Display */}
                {(interimTranscript || liveTranscript) && (
                  <div className="absolute bottom-20 left-4 right-4">
                    <Card className="bg-black/80 backdrop-blur-sm text-white border-gray-600">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mt-2" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-300 mb-1">
                              Live Speech Recognition{' '}
                              {confidenceLevel > 0 &&
                                `(${Math.round(confidenceLevel * 100)}% confidence)`}
                            </div>
                            <div className="text-sm font-medium">
                              {interimTranscript || liveTranscript}
                              <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Processing Indicator */}
                {speechProcessingState === 'processing' && !isAISpeaking && (
                  <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                    <Badge
                      variant="default"
                      className="flex items-center gap-2 px-3 py-2 text-sm animate-pulse"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing your response...
                    </Badge>
                  </div>
                )}

                <div className="text-center space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                      {(isAISpeaking || isConnected || isSoundDetected) && (
                        <Ripple
                          mainCircleSize={120}
                          numCircles={
                            isAISpeaking ? 8 : isSoundDetected ? 6 : 4
                          }
                          className={
                            isAISpeaking
                              ? 'text-blue-500'
                              : isSoundDetected
                                ? 'text-green-500'
                                : 'text-primary'
                          }
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bot
                          className={cn(
                            'w-12 h-12 z-10 transition-colors duration-300',
                            isAISpeaking
                              ? 'text-blue-500'
                              : isSoundDetected
                                ? 'text-green-500'
                                : 'text-primary'
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">AI Interviewer</h3>
                      <p className="text-sm text-muted-foreground">
                        {isAISpeaking
                          ? 'Speaking...'
                          : speechProcessingState === 'processing'
                            ? 'Thinking...'
                            : isSoundDetected
                              ? 'Listening to you...'
                              : isListeningActive
                                ? 'Ready to listen...'
                                : 'Inactive'}
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
                  {isInterviewActive && (
                    <div
                      className={`mt-1 text-xs ${
                        remainingTime <= 60
                          ? 'text-red-500 font-semibold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Remaining: {formatTime(remainingTime)}
                    </div>
                  )}
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
