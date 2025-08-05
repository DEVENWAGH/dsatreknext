import SpeechRecognition from 'react-speech-recognition';

class JarvisVoiceService {
  constructor() {
    this.isListening = false;
    this.onTranscript = null;
    this.onInterimTranscript = null; // New: for real-time transcript
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onError = null;
    this.jarvisProcess = null;
    this.isActive = false;
    this.isMuted = false;
    this.currentContext = {};
    this.lastTranscript = '';
    this.speakingTimeout = null;
    this.isAISpeaking = false;
    this.speechEndTimeout = null;
    this.lastInterimTranscript = '';
    this.debugCallback = null; // For debugging
    this.transcriptHistory = []; // Store transcript history
  }

  async initialize() {
    try {
      if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        throw new Error('Browser does not support speech recognition');
      }

      // Wait for voices to load
      if (speechSynthesis.getVoices().length === 0) {
        await new Promise(resolve => {
          speechSynthesis.onvoiceschanged = resolve;
        });
      }

      await this.startJarvisProcess();
      this.debugLog(
        'Jarvis voice service initialized with react-speech-recognition'
      );
      console.log(
        '🎤 Jarvis voice service initialized with react-speech-recognition'
      );
      return true;
    } catch (error) {
      console.error('Jarvis voice service initialization failed:', error);
      this.debugLog('Initialization failed', error.message);
      return false;
    }
  }

  async startJarvisProcess() {
    this.jarvisProcess = `interview_${Date.now()}`;
    this.debugLog('Jarvis session started', this.jarvisProcess);
    console.log('🤖 Jarvis session started:', this.jarvisProcess);
  }

  async sendToJarvis(text, context = {}) {
    this.debugLog('Sending to Jarvis', {
      text: text.substring(0, 100),
      context,
    });

    try {
      // Use LangChain agent directly in browser
      const { default: langchainAgent } = await import(
        '@/services/langchainInterviewAgent'
      );
      const response = await langchainAgent.chat(
        text,
        this.jarvisProcess,
        context
      );
      this.debugLog('LangChain response received', response.substring(0, 100));
      return response;
    } catch (error) {
      console.error('Error with LangChain agent:', error);
      this.debugLog('LangChain error, trying API fallback', error.message);

      // Fallback to API
      try {
        const response = await fetch('/api/jarvis/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            session_id: this.jarvisProcess,
            context,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          this.debugLog(
            'API response received',
            data.response?.substring(0, 100)
          );
          return data.response;
        }
      } catch (apiError) {
        console.error('API fallback failed:', apiError);
        this.debugLog('API fallback failed', apiError.message);
      }
    }
    return "I'm sorry, could you please repeat that?";
  }

  startListening() {
    if (this.isAISpeaking) {
      this.debugLog('Cannot start listening - AI is speaking');
      console.log('🎤 AI is speaking, delaying listening restart...');
      return;
    }

    if (this.isMuted || !this.isActive) {
      this.debugLog('Cannot start listening - muted or inactive');
      console.log('🎤 Cannot start listening - muted or inactive');
      return;
    }

    this.debugLog('Starting listening with Indian English recognition');
    console.log('🎤 Starting listening with react-speech-recognition (en-IN)');

    try {
      SpeechRecognition.startListening({
        continuous: true,
        interimResults: true, // Enable interim results for real-time feedback
        language: 'en-IN', // Changed to Indian English
      });
      this.isListening = true;
      this.debugLog('Started listening successfully with Indian English');
      console.log(
        '🎤 Started listening successfully with Indian English and interim results'
      );
    } catch (error) {
      console.error('🎤 Error starting recognition:', error);
      this.debugLog('Error starting recognition', error.message);
      if (this.onError) this.onError(error);
    }
  }

  // New method to handle interim results with real-time display
  handleInterimTranscript(interimTranscript) {
    if (interimTranscript && interimTranscript !== this.lastInterimTranscript) {
      this.lastInterimTranscript = interimTranscript;
      this.debugLog('Interim transcript (real-time)', interimTranscript);
      console.log('🎤 INTERIM (real-time):', interimTranscript);

      // Add to transcript history for debugging
      this.transcriptHistory.push({
        type: 'interim',
        text: interimTranscript,
        timestamp: Date.now(),
      });

      // Keep only last 20 entries
      if (this.transcriptHistory.length > 20) {
        this.transcriptHistory = this.transcriptHistory.slice(-20);
      }

      // Send interim transcript to UI for real-time display
      if (this.onInterimTranscript) {
        this.onInterimTranscript(interimTranscript);
      }
    }
  }

  // Enhanced method to handle final transcript with better patience
  handleFinalTranscript(finalTranscript) {
    if (!finalTranscript || finalTranscript.trim() === '') return;

    const trimmedTranscript = finalTranscript.trim();

    // Only process if transcript has meaningful content (at least 3 characters)
    if (trimmedTranscript.length < 3) return;

    this.debugLog('Final transcript processed (en-IN)', trimmedTranscript);
    console.log('🎤 FINAL TRANSCRIPT (en-IN):', trimmedTranscript);

    // Add to transcript history
    this.transcriptHistory.push({
      type: 'final',
      text: trimmedTranscript,
      timestamp: Date.now(),
    });

    // Clear any pending speech end timeout
    if (this.speechEndTimeout) {
      clearTimeout(this.speechEndTimeout);
    }

    // Process the final transcript
    if (this.onTranscript) {
      this.onTranscript(trimmedTranscript, 'user');
    }

    // Reset interim transcript
    this.lastInterimTranscript = '';
  }

  // Enhanced method to detect speech end with longer delay for Indian English
  detectSpeechEnd(transcript, interimTranscript) {
    // Clear existing timeout
    if (this.speechEndTimeout) {
      clearTimeout(this.speechEndTimeout);
    }

    // If we have a transcript but no interim results, user likely stopped speaking
    if (transcript && !interimTranscript) {
      this.speechEndTimeout = setTimeout(() => {
        this.debugLog('Speech end detected after patience period (en-IN)');
        console.log('🎤 Speech end detected after 4s patience period');
        this.handleFinalTranscript(transcript);
      }, 4000); // Increased to 4 seconds for better patience with Indian English
    }
  }

  stopListening() {
    if (this.isListening) {
      SpeechRecognition.stopListening();
      this.isListening = false;
      this.debugLog('Stopped listening');
      console.log('🎤 Stopped listening');
    }
  }

  async startInterview({
    position,
    candidateName,
    questions,
    sessionId,
    interviewType,
    difficulty,
  }) {
    try {
      this.currentContext = {
        position,
        candidateName,
        questions,
        interviewType,
        difficulty,
      };
      this.jarvisProcess = sessionId;
      this.isActive = true;

      this.debugLog('Starting interview', {
        position,
        candidateName,
        questionsCount: questions.length,
      });

      // Process questions to ensure consistent format
      const processedQuestions = questions.map(q => {
        if (typeof q === 'string') return q;
        return q.question || q.text || 'Question not available';
      });

      // Send initial greeting with context
      const greeting = `Hi ${candidateName}! I'm your AI interviewer for the ${position} position. This is a ${interviewType || 'technical'} interview with ${difficulty || 'medium'} difficulty level. We have ${processedQuestions.length} questions to cover. Are you ready to begin?`;
      await this.speak(greeting);

      this.debugLog('Interview started successfully');
      console.log('🎙️ Interview started with Jarvis');
      console.log('📋 Questions loaded:', processedQuestions.length);
      return true;
    } catch (error) {
      console.error('Failed to start interview:', error);
      this.debugLog('Failed to start interview', error.message);
      this.isActive = false;
      throw error;
    }
  }

  async speak(text) {
    this.isAISpeaking = true;
    this.debugLog('AI starting to speak', text.substring(0, 100) + '...');

    if (this.onSpeechStart) this.onSpeechStart();

    // Stop listening while speaking
    this.stopListening();

    // Clear any existing timeout
    if (this.speakingTimeout) {
      clearTimeout(this.speakingTimeout);
    }

    // Use Web Speech API for TTS with male voice
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      // Configure for male voice like Python Jarvis
      const voices = speechSynthesis.getVoices();
      const maleVoice = voices.find(
        voice =>
          voice.name.includes('David') ||
          voice.name.includes('Male') ||
          voice.name.includes('Mark') ||
          (voice.name.includes('Microsoft') && voice.name.includes('David')) ||
          voice.gender === 'male'
      );

      if (maleVoice) {
        utterance.voice = maleVoice;
        this.debugLog('Using male voice', maleVoice.name);
        console.log('🎤 Using male voice:', maleVoice.name);
      }

      utterance.rate = 0.9; // Faster for better responsiveness
      utterance.pitch = 0.8; // Lower pitch for masculine tone
      utterance.volume = 1.0;

      utterance.onend = () => {
        this.debugLog('AI speech ended, preparing to restart listening');
        console.log('🎤 AI speech ended, preparing to restart listening...');
        this.isAISpeaking = false;

        if (this.onSpeechEnd) this.onSpeechEnd();

        // Resume listening after speaking with a proper delay
        if (this.isActive && !this.isMuted) {
          this.speakingTimeout = setTimeout(() => {
            this.debugLog('Restarting listening after AI speech');
            console.log('🎤 Restarting listening after AI speech...');
            this.startListening();
          }, 800); // Increased delay to ensure clean restart
        }
      };

      utterance.onerror = event => {
        console.error('🎤 Speech synthesis error:', event);
        this.debugLog('Speech synthesis error', event.error);
        this.isAISpeaking = false;
        // Still try to restart listening on error
        if (this.isActive && !this.isMuted) {
          this.speakingTimeout = setTimeout(() => {
            this.startListening();
          }, 1000);
        }
      };

      speechSynthesis.speak(utterance);
    }

    // Record AI response in transcript
    if (this.onTranscript) {
      this.onTranscript(text, 'assistant');
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    this.debugLog(`Voice service ${muted ? 'muted' : 'unmuted'}`);
    console.log(`🎤 Voice service ${muted ? 'muted' : 'unmuted'}`);

    if (muted) {
      this.stopListening();
    } else if (this.isActive && !this.isAISpeaking) {
      // Restart listening when unmuted (unless AI is currently speaking)
      setTimeout(() => {
        this.startListening();
      }, 500);
    }
  }

  stop() {
    this.isActive = false;
    this.isAISpeaking = false;

    // Clear any pending timeouts
    if (this.speakingTimeout) {
      clearTimeout(this.speakingTimeout);
      this.speakingTimeout = null;
    }

    if (this.speechEndTimeout) {
      clearTimeout(this.speechEndTimeout);
      this.speechEndTimeout = null;
    }

    this.stopListening();
    SpeechRecognition.abortListening();

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    this.debugLog('Interview stopped');
    console.log('🛑 Interview stopped');
  }

  setCallbacks({ onTranscript, onInterimTranscript, onError, onDebug }) {
    this.onTranscript = onTranscript;
    this.onInterimTranscript = onInterimTranscript; // New callback
    this.onError = onError;
    this.debugCallback = onDebug;
  }

  // Get transcript history for debugging
  getTranscriptHistory() {
    return this.transcriptHistory;
  }

  // Clear transcript history
  clearTranscriptHistory() {
    this.transcriptHistory = [];
    this.debugLog('Transcript history cleared');
  }

  // Debug logging method
  debugLog(message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data,
      service: 'jarvis',
    };

    if (this.debugCallback) {
      this.debugCallback(logEntry);
    }
  }

  async cleanup() {
    this.stop();
    this.jarvisProcess = null;
    this.currentContext = {};
    this.lastTranscript = '';
    this.transcriptHistory = [];
    this.debugLog('Jarvis voice service cleaned up');
  }
}

const jarvisVoiceServiceInstance = new JarvisVoiceService();
export default jarvisVoiceServiceInstance;
