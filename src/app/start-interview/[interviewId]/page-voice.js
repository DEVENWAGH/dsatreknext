'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import jarvisVoiceService from '@/services/jarvisVoiceService';
import ttsService from '@/services/ttsService';

export default function StartInterviewPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  // Interview state
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Voice interview state
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [voiceError, setVoiceError] = useState(null);

  const { getInterviewById, getInterviewFromCache, updateInterviewStatus } = useInterviewStore();

  // Helper function to get questions consistently
  const getQuestions = interviewData => {
    if (!interviewData) return [];
    const questions = interviewData.questions || interviewData.generatedQuestions || [];
    return Array.isArray(questions) ? questions : [];
  };

  // Parse duration to seconds
  const parseDurationToSeconds = duration => {
    if (!duration) return 900;
    const match = duration.match(/(\\d+)\\s*(minute|min|hour|hr)s?/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('hour') || unit.startsWith('hr')) {
        return value * 3600;
      }
      return value * 60;
    }
    return 900;
  };

  // Format time display
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle ending interview
  const handleInterviewEnd = useCallback(async () => {
    if (feedbackSaved) return;
    setFeedbackSaved(true);
    
    try {
      // Use conversation state instead of getConversation()
      const questions = getQuestions(interview);
      const completionRate = Math.round((elapsedTime / totalDuration) * 100);
      
      console.log('🤖 Generating AI feedback with conversation:', conversation);
      
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
          transcript: conversation
        })
      });
      
      let feedback = `Interview completed for ${interview?.position || 'position'}. Duration: ${formatTime(elapsedTime)}.`;
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        feedback = feedbackData.feedback;
      }

      await fetch(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'completed',
          feedback: feedback
        })
      });

      toast.success('Interview completed and feedback saved!');
      setTimeout(() => {
        router.push(`/interview-details/${interviewId}`);
      }, 2000);
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Error saving interview results');
    }
  }, [interview, elapsedTime, totalDuration, getConversation, feedbackSaved, interviewId, router]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isInterviewActive && interviewStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - interviewStartTime) / 1000);
        const remaining = Math.max(0, totalDuration - elapsed);

        setElapsedTime(elapsed);
        setRemainingTime(remaining);

        if (remaining <= 0) {
          console.log('⏰ Time up - ending interview');
          toast.success('Interview completed! Time is up.');
          setIsInterviewActive(false);
          handleInterviewEnd();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewActive, interviewStartTime, totalDuration, handleInterviewEnd]);

  // Initialize Jarvis voice service
  useEffect(() => {
    const initJarvis = async () => {
      const voiceSuccess = await jarvisVoiceService.initialize();
      const ttsSuccess = ttsService.initialize();
      setIsInitialized(voiceSuccess && ttsSuccess);
      
      jarvisVoiceService.setCallbacks({
        onTranscript: (text) => {
          setTranscript(text);
          handleUserInput(text);
        },
        onError: (error) => setVoiceError(error)
      });
      
      ttsService.setCallbacks({
        onSpeechStart: () => setIsSpeaking(true),
        onSpeechEnd: () => setIsSpeaking(false)
      });
    };
    
    initJarvis();
    return () => jarvisVoiceService.cleanup();
  }, []);

  // Handle user input and get Jarvis response
  const handleUserInput = async (userText) => {
    if (!userText.trim()) return;
    
    // Add user message to conversation
    setConversation(prev => [...prev, { role: 'user', text: userText, timestamp: new Date().toISOString() }]);
    
    // Check for end phrases
    const endPhrases = ['goodbye', 'end interview', 'finish interview', 'stop interview', 'thank you', 'that\'s all', 'we\'re done'];
    if (endPhrases.some(phrase => userText.toLowerCase().includes(phrase))) {
      console.log('✅ End phrase detected:', userText);
      setIsInterviewActive(false);
      handleInterviewEnd();
      return;
    }
    
    // Get response from Jarvis with context
    const userName = session?.user?.firstName || session?.user?.name || 'candidate';
    const context = {
      position: interview?.position,
      candidateName: userName,
      interviewType: interview?.interviewType
    };
    
    const response = await jarvisVoiceService.sendToJarvis(userText, context);
    
    // Add AI response to conversation
    setConversation(prev => [...prev, { role: 'assistant', text: response, timestamp: new Date().toISOString() }]);
    
    // Speak the response
    await ttsService.speak(response);
  };

  // Set total duration when interview loads
  useEffect(() => {
    if (interview?.duration) {
      const duration = parseDurationToSeconds(interview.duration);
      setTotalDuration(duration);
      setRemainingTime(duration);
    }
  }, [interview]);

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
        const cachedInterview = getInterviewFromCache(interviewId);
        if (cachedInterview) {
          setInterview(cachedInterview);
          setLoading(false);
          return;
        }

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

  // Handle user speech
  useEffect(() => {
    if (transcript && isInterviewActive) {
      const endPhrases = ['goodbye', 'end interview', 'finish interview', 'stop interview', 'thank you', 'that\\'s all', 'we\\'re done'];
      const lowerTranscript = transcript.toLowerCase();
      
      if (endPhrases.some(phrase => lowerTranscript.includes(phrase))) {
        console.log('✅ End phrase detected:', transcript);
        setIsInterviewActive(false);
        handleInterviewEnd();
        return;
      }

      // Generate AI response
      const handleAIResponse = async () => {
        try {
          const questions = getQuestions(interview);
          const userName = session?.user?.firstName || session?.user?.name || 'candidate';
          
          const context = {
            position: interview.position,
            interviewType: interview.interviewType,
            candidateName: userName,
            totalQuestions: questions.length
          };

          const currentQuestion = questions[currentQuestionIndex];
          const response = await aiInterviewService.generateResponse(transcript, context);
          
          await speak(response);
          
          // Move to next question if appropriate
          if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
              setCurrentQuestionIndex(prev => prev + 1);
            }, 2000);
          }
        } catch (error) {
          console.error('Error generating AI response:', error);
        }
      };

      handleAIResponse();
    }
  }, [transcript, isInterviewActive, currentQuestionIndex, interview, session, speak, handleInterviewEnd]);

  // Start interview
  const handleStartInterview = async () => {
    if (!isInitialized) {
      toast.error('Voice service not initialized');
      return;
    }

    const questions = getQuestions(interview);
    if (!questions || questions.length === 0) {
      toast.error('No questions available for this interview');
      return;
    }

    try {
      setIsInterviewActive(true);
      setInterviewStartTime(new Date());
      aiInterviewService.setQuestions(questions);
      
      const userName = session?.user?.firstName || session?.user?.name || 'candidate';
      const welcomeMessage = `Hi ${userName}! I'm your AI interviewer for the ${interview.position} position. Are you ready to begin?`;
      
      await speak(welcomeMessage);
      toast.success('Interview started!');
    } catch (error) {
      console.error('Failed to start interview:', error);
      toast.error('Failed to start interview');
    }
  };

  // Stop interview
  const handleStopInterview = () => {
    setIsInterviewActive(false);
    stopListening();
    handleInterviewEnd();
  };

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

  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Unable to Start Interview
          </h2>
          <p className="text-muted-foreground">{error || 'Interview not found'}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-2">
          <Card className="h-full flex items-center justify-center relative overflow-hidden">
            {!isInterviewActive && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold">Ready to start your interview?</h2>
                  <p className="text-muted-foreground">Position: {interview.position}</p>
                  <p className="text-muted-foreground">Type: {interview.interviewType}</p>
                  <Button
                    onClick={handleStartInterview}
                    disabled={!isInitialized}
                    size="lg"
                    className="px-6"
                  >
                    {!isInitialized ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      'Start Interview'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {isInterviewActive && (
              <>
                <div className="absolute top-2 right-2 z-50">
                  <Badge variant={remainingTime <= 60 ? 'destructive' : 'secondary'}>
                    {formatTime(remainingTime)}
                  </Badge>
                </div>

                <div className="text-center space-y-4">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                    {(isSpeaking || isListening) && <Ripple mainCircleSize={120} numCircles={6} />}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Bot className="w-12 h-12 text-primary z-10" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">AI Interviewer</h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready'}
                    </p>
                  </div>
                  {transcript && (
                    <div className="max-w-md mx-auto p-3 bg-muted rounded-lg">
                      <p className="text-sm">{transcript}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <Card className="rounded-none border-x-0 border-b-0 h-16">
        <div className="flex items-center justify-center h-full space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => {
              if (isListening) {
                jarvisVoiceService.stopListening();
                setIsListening(false);
              } else {
                jarvisVoiceService.startListening();
                setIsListening(true);
              }
            }}
            disabled={!isInterviewActive}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
    </div>
  );
}