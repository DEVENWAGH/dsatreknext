'use client';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import jarvisVoiceService from '@/services/jarvisVoiceService';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useSession } from 'next-auth/react';
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
    browserSupportsSpeechRecognition
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
            console.log('🤖 Sending transcript to AI for feedback. Entries:', interviewTranscript.length);
            console.log('📜 Full transcript:', interviewTranscript);
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
                transcript: interviewTranscript
              })
            });
            
            if (feedbackResponse.ok) {
              const feedbackData = await feedbackResponse.json();
              feedback = feedbackData.feedback;
            } else {
              throw new Error('Feedback generation failed');
            }
          } catch (error) {
            console.error('AI feedback generation failed:', error);
            feedback = `Interview completed for ${interview?.position || 'position'}. Duration: ${formatTime(elapsedTime)}. The candidate participated in a ${interview?.interviewType || 'interview'} session.`;
          }
        }

        console.log('Saving feedback:', feedback);
        
        // Update interview status to completed with feedback
        const response = await fetch(`/api/interviews/${interviewId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'completed',
            feedback: feedback
          })
        });
        
        if (response.ok) {
          console.log('Feedback saved successfully');
          toast.success('Interview completed and feedback saved!');
        } else {
          console.error('Failed to save feedback');
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

        // Navigate to interview details to show results
        setTimeout(() => {
          router.push(`/interview-details/${interviewId}`);
        }, 2000);
      } catch (error) {
        console.error('Error in handleInterviewEnd:', error);
        toast.error('Error saving interview results');
      }
    },
    [responses, updateInterviewStatus, interviewId, elapsedTime, router, interview, totalDuration, feedbackSaved]
  );

  // Parse duration to seconds
  const parseDurationToSeconds = duration => {
    if (!duration) return 900; // Default 15 minutes
    const match = duration.match(/(\d+)\s*(minute|min|hour|hr)s?/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('hour') || unit.startsWith('hr')) {
        return value * 3600;
      }
      return value * 60;
    }
    return 900; // Default 15 minutes
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

  // Initialize Jarvis
  useEffect(() => {
    const initJarvis = async () => {
      if (jarvis || isVoiceInitialized) return;

      try {
        const jarvisInstance = jarvisVoiceService;
        setJarvis(jarvisInstance);
        setIsVoiceInitialized(true);

        // Set up event listeners
        jarvisInstance.onTranscript = (transcript, role) => {
          const transcriptEntry = {
            role: role || 'user',
            text: transcript,
            timestamp: new Date().toISOString()
          };
          console.log('📝 Recording transcript:', transcriptEntry);
          setInterviewTranscript(prev => {
            const updated = [...prev, transcriptEntry];
            console.log('📋 Total transcript entries:', updated.length);
            return updated;
          });
          
          // Check for end phrases
          const text = transcript?.toLowerCase() || '';
          const endPhrases = ['goodbye', 'good bye', 'end interview', 'finish interview', 'stop interview', 'thank you for your time', 'that\'s all', 'we\'re done', 'interview complete', 'i\'m done', 'that concludes', 'end this'];
          
          console.log('🔍 Checking transcript for end phrases:', text);
          const foundPhrase = endPhrases.find(phrase => text.includes(phrase));
          
          if (foundPhrase) {
            console.log('✅ End phrase detected:', foundPhrase, 'in:', text);
            setTimeout(() => {
              jarvisInstance.stop();
              handleInterviewEnd();
            }, 2000);
          }
        };

        jarvisInstance.onSpeechStart = () => {
          setIsAISpeaking(true);
        };

        jarvisInstance.onSpeechEnd = () => {
          setIsAISpeaking(false);
        };

        jarvisInstance.onError = (error) => {
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
        toast.error('Speech recognition not supported in this browser. Please use Chrome or Edge.');
        setError('Speech recognition not supported in this browser');
        return;
      }

      const jobPosition = interview.position || interview.jobPosition || 'position';
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
        toast.error('Voice system initialization failed. Please try refreshing the page.');
        setError('Voice system initialization failed');
        return;
      }

      // Start Jarvis voice interview
      await jarvis.startInterview({
        position: jobPosition,
        candidateName: userName,
        questions: questions.map(q => typeof q === 'string' ? q : q.question),
        sessionId: interviewId
      });
      
      console.log('✅ Voice interview started successfully');
    } catch (error) {
      console.error('❌ Failed to start voice interview:', error);
      toast.error(`Failed to start interview: ${error.message || 'Unknown error'}`);
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

  // Format time display
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('pagehide', handlePageExit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInterviewActive, jarvis]);

  // Handle transcript from react-speech-recognition with debouncing
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const debounceTimeoutRef = useRef(null);
  
  useEffect(() => {
    if (transcript && isInterviewActive && jarvis && !isProcessingTranscript) {
      const trimmedTranscript = transcript.trim();
      
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Only process meaningful input (at least 3 words)
      const wordCount = trimmedTranscript.split(' ').filter(word => word.length > 0).length;
      if (wordCount >= 3) {
        // Debounce for 2 seconds to ensure user finished speaking
        debounceTimeoutRef.current = setTimeout(() => {
          if (!isProcessingTranscript) {
            setIsProcessingTranscript(true);
            console.log('🎤 PROCESSING SPEECH:', trimmedTranscript);
            
            // Process the transcript
            const transcriptEntry = {
              role: 'user',
              text: trimmedTranscript,
              timestamp: new Date().toISOString()
            };
            
            setInterviewTranscript(prev => {
              const updated = [...prev, transcriptEntry];
              console.log('📋 Total transcript entries:', updated.length);
              return updated;
            });
            
            // Get AI response
            console.log('🤖 Getting AI response for:', trimmedTranscript);
            
            fetch('/api/jarvis/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: trimmedTranscript,
                sessionId: jarvis.sessionId || interviewId,
                interviewType: interview?.type || 'technical',
                candidateName: session?.user?.name || 'Candidate'
              })
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
                  timestamp: new Date().toISOString()
                };
                
                setInterviewTranscript(prev => {
                  const updated = [...prev, aiMessage];
                  console.log('📋 AI response added, total entries:', updated.length);
                  return updated;
                });
                
                jarvis.speak(data.response);
              } else {
                console.error('No response in data:', data);
                jarvis.speak("I'm having trouble understanding. Could you try again?");
              }
            })
            .catch(error => {
              console.error('🚨 API Error:', error);
              jarvis.speak("I'm having trouble understanding. Could you try again?");
            })
            .finally(() => {
              // Reset processing state after 3 seconds
              setTimeout(() => {
                setIsProcessingTranscript(false);
                resetTranscript();
              }, 3000);
            });
          }
        }, 2000);
      }
    }
  }, [transcript, isInterviewActive, jarvis, isProcessingTranscript, resetTranscript, interviewId, interview, session]);

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

                {/* Time Warning */}
                {remainingTime <= 60 && remainingTime > 0 && (
                  <div className="absolute top-14 right-2">
                    <Badge
                      variant="destructive"
                      className="text-xs animate-bounce"
                    >
                      ⚠️ 1 minute left!
                    </Badge>
                  </div>
                )}

                <div className="text-center space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                      {(isAISpeaking || isConnected) && <Ripple mainCircleSize={120} numCircles={6} />}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bot className="w-12 h-12 text-primary z-10" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">AI Interviewer</h3>
                      <p className="text-sm text-muted-foreground">
                        {isAISpeaking ? 'Speaking...' : 'Listening...'}
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
