import { useState, useCallback, useRef } from 'react';
import voiceService from '@/services/voiceService';

export const useVoiceInterview = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState(''); // New: real-time transcript
  const [error, setError] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]); // New: debug logging
  const conversationRef = useRef([]);

  const initialize = useCallback(async () => {
    try {
      const success = await voiceService.initialize();
      if (success) {
        voiceService.setCallbacks({
          onTranscript: ({ transcript, isFinal }) => {
            if (isFinal) {
              setTranscript(transcript);
              setInterimTranscript(''); // Clear interim when final received
              conversationRef.current.push({
                role: 'user',
                text: transcript,
                timestamp: new Date().toISOString(),
              });
              console.log('📝 User said:', transcript);
            }
          },
          onInterimTranscript: ({ transcript }) => {
            setInterimTranscript(transcript); // Show real-time updates
          },
          onSpeechStart: () => setIsSpeaking(true),
          onSpeechEnd: () => setIsSpeaking(false),
          onError: error => setError(error),
          onDebug: logEntry => {
            setDebugLogs(prev => [...prev.slice(-49), logEntry]); // Keep last 50 logs
          },
        });
        setIsInitialized(true);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const startListening = useCallback(() => {
    if (isInitialized && !isSpeaking) {
      voiceService.startListening();
      setIsListening(true);
    }
  }, [isInitialized, isSpeaking]);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
  }, []);

  const speak = useCallback(
    async text => {
      if (isInitialized) {
        try {
          // Stop listening while speaking
          if (isListening) {
            stopListening();
          }

          await voiceService.speak(text);

          // Add to conversation
          conversationRef.current.push({
            role: 'assistant',
            text: text,
            timestamp: new Date().toISOString(),
          });

          // Resume listening after speaking
          setTimeout(() => {
            startListening();
          }, 500);
        } catch (err) {
          setError(err.message);
        }
      }
    },
    [isInitialized, isListening, startListening, stopListening]
  );

  const getConversation = useCallback(() => {
    return conversationRef.current;
  }, []);

  const getDebugLogs = useCallback(() => {
    return debugLogs;
  }, [debugLogs]);

  const clearDebugLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  const cleanup = useCallback(() => {
    voiceService.destroy();
    setIsInitialized(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');
    setInterimTranscript('');
    setDebugLogs([]);
    conversationRef.current = [];
  }, []);

  return {
    isInitialized,
    isListening,
    isSpeaking,
    transcript,
    interimTranscript, // New: real-time transcript
    error,
    debugLogs, // New: debug logs
    initialize,
    startListening,
    stopListening,
    speak,
    getConversation,
    getDebugLogs,
    clearDebugLogs,
    cleanup,
  };
};
