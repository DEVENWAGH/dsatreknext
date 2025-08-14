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

      // Set up conversation updates - this is the key fix!
      voiceAgentRef.current.setOnConversationUpdate(message => {
        console.log('📝 Conversation update received:', message);
        console.log(
          '📝 Message role:',
          message.role,
          'Content:',
          message.content?.substring(0, 50) + '...'
        );

        setConversation(prev => {
          // Check for duplicates to prevent double updates
          const isDuplicate = prev.some(
            msg =>
              msg.content === message.content &&
              msg.role === message.role &&
              Math.abs(
                new Date(msg.timestamp).getTime() -
                  new Date(message.timestamp).getTime()
              ) < 1000
          );

          if (isDuplicate) {
            console.log('🚫 Duplicate message detected, skipping');
            return prev;
          }

          const newMessage = {
            id: Date.now() + Math.random(),
            role: message.role,
            content: message.content,
            timestamp: message.timestamp || new Date().toISOString(),
          };

          const newConversation = [...prev, newMessage];
          console.log(
            '📝 Updated conversation:',
            newConversation.length,
            'messages'
          );
          console.log('📝 Latest message:', newMessage);

          return newConversation;
        });
      });

      voiceAgentRef.current.setOnStatusChange(newStatus => {
        console.log('🔄 Status change:', newStatus);
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
            setIsListening(false);
            setIsSpeaking(false);
            break;
          case 'active':
            setIsConnected(true);
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

      // Test audio levels for 2 seconds
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      analyser.fftSize = 512;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let maxLevel = 0;
      const testDuration = 2000;
      const startTime = Date.now();

      const result = await new Promise(resolve => {
        const checkLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / bufferLength);
          const level = Math.round((rms / 255) * 100);
          maxLevel = Math.max(maxLevel, level);

          if (Date.now() - startTime < testDuration) {
            requestAnimationFrame(checkLevel);
          } else {
            stream.getTracks().forEach(track => track.stop());
            console.log(`🎤 Microphone test complete. Max level: ${maxLevel}%`);
            resolve({ success: true, maxLevel });
          }
        };
        checkLevel();
      });

      if (result.maxLevel < 3) {
        setError(
          'Microphone level very low. Please check your microphone or speak louder.'
        );
        return false;
      }

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
      console.log('🔧 Configuration test result:', configData);
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
    // Expose voice agent for debugging
    voiceAgent: voiceAgentRef.current,
  };
};
