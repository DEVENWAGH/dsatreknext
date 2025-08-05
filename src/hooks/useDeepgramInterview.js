import { useState, useEffect, useCallback, useRef } from 'react';
import DeepgramVoiceAgent from '../services/deepgramVoiceAgent';

export const useDeepgramInterview = (interviewConfig) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [error, setError] = useState(null);
  const [interviewStatus, setInterviewStatus] = useState('idle'); // idle, connecting, active, ended
  
  const voiceAgentRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize Deepgram Voice Agent
  const initializeVoiceAgent = useCallback(async () => {
    try {
      // Get Deepgram API key from secure endpoint
      const keyResponse = await fetch('/api/voice-agent/key');
      const keyData = await keyResponse.json();
      
      if (!keyData.success || !keyData.key) {
        throw new Error('Failed to get Deepgram API key');
      }

      setInterviewStatus('connecting');
      setError(null);

      voiceAgentRef.current = new DeepgramVoiceAgent(keyData.key);

      // Set up event handlers
      voiceAgentRef.current.setOnConversationUpdate((data) => {
        setConversation(prev => [...prev, {
          id: Date.now() + Math.random(),
          role: data.role,
          content: data.content,
          timestamp: new Date().toISOString()
        }]);
      });

      voiceAgentRef.current.setOnAudioReceived((audioBuffer) => {
        // Handle received audio if needed
        setCurrentAudio(audioBuffer);
      });

      voiceAgentRef.current.setOnError((error) => {
        console.error('Deepgram Voice Agent Error:', error);
        setError(error.message || 'Voice agent error occurred');
        setInterviewStatus('error');
      });

      // Start the voice interview
      await voiceAgentRef.current.startVoiceInterview(interviewConfig);
      
      setIsConnected(true);
      setInterviewStatus('active');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize voice agent:', error);
      setError(error.message || 'Failed to initialize voice interview');
      setInterviewStatus('error');
      return false;
    }
  }, [interviewConfig]);

  // Start audio recording from microphone
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && voiceAgentRef.current && isConnected) {
          // Convert blob to buffer and send to Deepgram
          event.data.arrayBuffer().then(buffer => {
            const audioData = new Uint8Array(buffer);
            voiceAgentRef.current.sendAudioChunk(audioData);
          });
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to access microphone');
    }
  }, [isConnected]);

  // Stop audio recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [isRecording]);

  // Start the interview
  const startInterview = useCallback(async () => {
    const success = await initializeVoiceAgent();
    if (success) {
      await startRecording();
    }
    return success;
  }, [initializeVoiceAgent, startRecording]);

  // End the interview
  const endInterview = useCallback(async () => {
    try {
      setInterviewStatus('ending');
      
      // Stop recording
      stopRecording();

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
        duration: interviewData?.duration || 0
      };
    } catch (error) {
      console.error('Failed to end interview:', error);
      setError('Failed to end interview properly');
      return { success: false, error: error.message };
    }
  }, [conversation, stopRecording]);

  // Get interview transcript
  const getTranscript = useCallback(() => {
    return conversation.map(msg => ({
      speaker: msg.role === 'user' ? 'Candidate' : 'Interviewer',
      content: msg.content,
      timestamp: msg.timestamp
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
      averageResponseLength: userMessages.length > 0 
        ? Math.round(userMessages.reduce((acc, msg) => acc + msg.content.length, 0) / userMessages.length)
        : 0
    };
  }, [conversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceAgentRef.current) {
        voiceAgentRef.current.endInterview().catch(console.error);
      }
      stopRecording();
    };
  }, [stopRecording]);

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
    startRecording,
    stopRecording,
    
    // Data
    getTranscript,
    getInterviewStats,
    
    // Utils
    clearError: () => setError(null)
  };
};
