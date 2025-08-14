import { useState, useEffect, useCallback, useRef } from 'react';
import DeepgramVoiceAgent from '../services/deepgramVoiceAgent';

export const useDeepgramInterview = interviewConfig => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [error, setError] = useState(null);
  const [interviewStatus, setInterviewStatus] = useState('idle');

  const voiceAgentRef = useRef(null);

  // Initialize Deepgram Voice Agent
  const initializeVoiceAgent = useCallback(async () => {
    try {
      // Get API keys from environment or secure endpoint
      const deepgramApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!deepgramApiKey || !geminiApiKey) {
        throw new Error('API keys not configured');
      }

      setInterviewStatus('connecting');
      setError(null);

      voiceAgentRef.current = new DeepgramVoiceAgent({
        deepgramApiKey,
        geminiApiKey,
      });

      // Set up event handlers
      voiceAgentRef.current.setOnConversationUpdate(message => {
        setConversation(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            role: message.role,
            content: message.content,
            timestamp: message.timestamp,
          },
        ]);
      });

      voiceAgentRef.current.setOnStatusChange(status => {
        console.log('Status changed to:', status);
        switch (status) {
          case 'initialized':
            setIsConnected(true);
            break;
          case 'listening':
            setIsRecording(true);
            break;
          case 'processing':
          case 'speaking':
            setIsRecording(false);
            break;
          case 'ready':
            setIsRecording(false);
            break;
          case 'active':
            setInterviewStatus('active');
            break;
          case 'ended':
            setInterviewStatus('ended');
            setIsConnected(false);
            setIsRecording(false);
            break;
        }
      });

      voiceAgentRef.current.setOnError(error => {
        console.error('Deepgram Voice Agent Error:', error);
        setError(error.message || 'Voice agent error occurred');
        setInterviewStatus('error');
      });

      // Initialize the voice agent
      const initialized =
        await voiceAgentRef.current.initialize(interviewConfig);
      if (!initialized) {
        throw new Error('Failed to initialize voice agent');
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize voice agent:', error);
      setError(error.message || 'Failed to initialize voice interview');
      setInterviewStatus('error');
      return false;
    }
  }, [interviewConfig]);

  // The DeepgramVoiceAgent handles its own recording, so we don't need separate recording methods

  // Start the interview
  const startInterview = useCallback(async () => {
    const success = await initializeVoiceAgent();
    if (success && voiceAgentRef.current) {
      const started = await voiceAgentRef.current.startInterview();
      return started;
    }
    return success;
  }, [initializeVoiceAgent]);

  // End the interview
  const endInterview = useCallback(async () => {
    try {
      setInterviewStatus('ending');

      // End voice agent interview
      let interviewData = null;
      if (voiceAgentRef.current) {
        interviewData = await voiceAgentRef.current.endInterview();
        voiceAgentRef.current = null;
      }

      setIsConnected(false);
      setInterviewStatus('ended');

      return {
        success: true,
        transcript: conversation,
        interviewData,
        totalMessages: conversation.length,
        duration: interviewData?.duration || 0,
      };
    } catch (error) {
      console.error('Failed to end interview:', error);
      setError('Failed to end interview properly');
      return { success: false, error: error.message };
    }
  }, [conversation]);

  // Get interview transcript
  const getTranscript = useCallback(() => {
    return conversation.map(msg => ({
      speaker: msg.role === 'user' ? 'Candidate' : 'Interviewer',
      content: msg.content,
      timestamp: msg.timestamp,
    }));
  }, [conversation]);

  // Get interview statistics
  const getInterviewStats = useCallback(() => {
    const userMessages = conversation.filter(msg => msg.role === 'user');
    const agentMessages = conversation.filter(msg => msg.role === 'assistant');

    return {
      totalMessages: conversation.length,
      candidateResponses: userMessages.length,
      interviewerQuestions: agentMessages.length,
      averageResponseLength:
        userMessages.length > 0
          ? Math.round(
              userMessages.reduce((acc, msg) => acc + msg.content.length, 0) /
                userMessages.length
            )
          : 0,
    };
  }, [conversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceAgentRef.current) {
        voiceAgentRef.current.endInterview().catch(error => {
          console.error('Failed to end interview cleanly:', error);
          setIsConnected(false);
          setInterviewStatus('ended');
        });
      }
    };
  }, []);

  return {
    // State
    isConnected,
    isRecording,
    conversation,
    currentAudio,
    error,
    interviewStatus,

    // Actions
    startInterview,
    endInterview,

    // Data
    getTranscript,
    getInterviewStats,

    // Utils
    clearError: () => setError(null),
  };
};
