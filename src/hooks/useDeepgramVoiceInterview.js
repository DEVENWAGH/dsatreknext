import { useState, useEffect, useCallback, useRef } from 'react';
import DeepgramVoiceAgent from '../services/deepgramVoiceAgent';

export const useDeepgramVoiceInterview = interviewConfig => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const voiceAgentRef = useRef(null);

  const initializeVoiceAgent = useCallback(async () => {
    try {
      setStatus('initializing');
      setError(null);

      const response = await fetch('/api/voice-agent/config');
      const configData = await response.json();

      if (!configData.success) {
        throw new Error(
          configData.error || 'Failed to get voice agent configuration'
        );
      }

      voiceAgentRef.current = new DeepgramVoiceAgent({
        deepgramApiKey: configData.deepgramApiKey,
        geminiApiKey: configData.geminiApiKey,
      });

      voiceAgentRef.current.setOnConversationUpdate(message => {
        setConversation(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            ...message,
          },
        ]);
      });

      voiceAgentRef.current.setOnStatusChange(newStatus => {
        setStatus(newStatus);

        switch (newStatus) {
          case 'listening':
            setIsListening(true);
            setIsSpeaking(false);
            break;
          case 'speaking':
            setIsListening(false);
            setIsSpeaking(true);
            break;
          case 'processing':
            setIsListening(false);
            setIsSpeaking(false);
            break;
          case 'ready':
          case 'active':
            setIsListening(false);
            setIsSpeaking(false);
            break;
          case 'ended':
            setIsConnected(false);
            setIsListening(false);
            setIsSpeaking(false);
            break;
        }
      });

      voiceAgentRef.current.setOnError(errorData => {
        console.error('Voice Agent Error:', errorData);
        setError(errorData.message || 'Voice agent error occurred');
        setStatus('error');
      });

      const success = await voiceAgentRef.current.initialize(interviewConfig);

      if (success) {
        setIsConnected(true);
        setStatus('initialized');
        return true;
      } else {
        throw new Error('Failed to initialize voice agent');
      }
    } catch (error) {
      console.error('Failed to initialize voice agent:', error);
      setError(error.message || 'Failed to initialize voice interview');
      setStatus('error');
      return false;
    }
  }, [interviewConfig]);

  const startInterview = useCallback(async () => {
    if (!voiceAgentRef.current) {
      const initialized = await initializeVoiceAgent();
      if (!initialized) return false;
    }

    try {
      const success = await voiceAgentRef.current.startInterview();
      return success;
    } catch (error) {
      console.error('Failed to start interview:', error);
      setError('Failed to start interview');
      return false;
    }
  }, [initializeVoiceAgent]);

  const endInterview = useCallback(async () => {
    if (!voiceAgentRef.current)
      return { success: false, error: 'No active interview' };

    try {
      setStatus('ending');
      const result = await voiceAgentRef.current.endInterview();
      voiceAgentRef.current = null;

      return {
        success: true,
        transcript: result.transcript,
        duration: result.duration,
        stats: result,
      };
    } catch (error) {
      console.error('Failed to end interview:', error);
      setError('Failed to end interview properly');
      return { success: false, error: error.message };
    }
  }, []);

  const getTranscript = useCallback(() => {
    if (voiceAgentRef.current) {
      return voiceAgentRef.current.getTranscript();
    }
    return conversation.map(msg => ({
      speaker: msg.role === 'user' ? 'Candidate' : 'Interviewer',
      content: msg.content,
      timestamp: msg.timestamp,
    }));
  }, [conversation]);

  const getInterviewStats = useCallback(() => {
    if (voiceAgentRef.current) {
      return voiceAgentRef.current.getStats();
    }

    const userMessages = conversation.filter(msg => msg.role === 'user');
    const assistantMessages = conversation.filter(
      msg => msg.role === 'assistant'
    );

    return {
      totalMessages: conversation.length,
      candidateResponses: userMessages.length,
      interviewerQuestions: assistantMessages.length,
      averageResponseLength:
        userMessages.length > 0
          ? Math.round(
              userMessages.reduce((acc, msg) => acc + msg.content.length, 0) /
                userMessages.length
            )
          : 0,
    };
  }, [conversation]);

  const testMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone test failed:', error);
      setError(
        'Microphone access denied. Please allow microphone access and try again.'
      );
      return false;
    }
  }, []);

  const testConfiguration = useCallback(async () => {
    try {
      const response = await fetch('/api/voice-agent/config');
      const configData = await response.json();
      return configData.success;
    } catch (error) {
      console.error('Configuration test failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (voiceAgentRef.current) {
        voiceAgentRef.current
          .endInterview()
          .catch(error =>
            console.error('Failed to end interview cleanly:', error)
          )
          .finally(() => {
            voiceAgentRef.current = null;
            setIsConnected(false);
            setStatus('ended');
          });
      }
    };
  }, []);

  return {
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
    clearError: () => setError(null),
    testMicrophone,
    testConfiguration,
  };
};
