import { useState, useCallback, useRef } from 'react';
import voiceService from '@/services/voiceService';

export const useVoiceInterview = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const conversationRef = useRef([]);

  const initialize = useCallback(async () => {
    try {
      const success = await voiceService.initialize();
      if (success) {
        voiceService.setCallbacks({
          onTranscript: ({ transcript, isFinal }) => {
            setTranscript(transcript);
            if (isFinal) {
              conversationRef.current.push({
                role: 'user',
                text: transcript,
                timestamp: new Date().toISOString()
              });
              console.log('📝 User said:', transcript);
            }
          },
          onSpeechStart: () => setIsSpeaking(true),
          onSpeechEnd: () => setIsSpeaking(false),
          onError: (error) => setError(error)
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

  const speak = useCallback(async (text) => {
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
          timestamp: new Date().toISOString()
        });
        
        // Resume listening after speaking
        setTimeout(() => {
          startListening();
        }, 500);
        
      } catch (err) {
        setError(err.message);
      }
    }
  }, [isInitialized, isListening, startListening, stopListening]);

  const getConversation = useCallback(() => {
    return conversationRef.current;
  }, []);

  const cleanup = useCallback(() => {
    voiceService.destroy();
    setIsInitialized(false);
    setIsListening(false);
    setIsSpeaking(false);
    conversationRef.current = [];
  }, []);

  return {
    isInitialized,
    isListening,
    isSpeaking,
    transcript,
    error,
    initialize,
    startListening,
    stopListening,
    speak,
    getConversation,
    cleanup
  };
};