import SpeechRecognition from 'react-speech-recognition';

class JarvisVoiceService {
  constructor() {
    this.isListening = false;
    this.onTranscript = null;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onError = null;
    this.jarvisProcess = null;
    this.isActive = false;
    this.isMuted = false;
    this.currentContext = {};
    this.lastTranscript = '';
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
      console.log('🎤 Jarvis voice service initialized with react-speech-recognition');
      return true;
    } catch (error) {
      console.error('Jarvis voice service initialization failed:', error);
      return false;
    }
  }

  async startJarvisProcess() {
    this.jarvisProcess = `interview_${Date.now()}`;
    console.log('🤖 Jarvis session started:', this.jarvisProcess);
  }

  async sendToJarvis(text, context = {}) {
    try {
      // Use LangChain agent directly in browser
      const { default: langchainAgent } = await import('@/services/langchainInterviewAgent');
      const response = await langchainAgent.chat(text, this.jarvisProcess, context);
      return response;
    } catch (error) {
      console.error('Error with LangChain agent:', error);
      // Fallback to API
      try {
        const response = await fetch('/api/jarvis/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            session_id: this.jarvisProcess,
            context
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.response;
        }
      } catch (apiError) {
        console.error('API fallback failed:', apiError);
      }
    }
    return "I'm sorry, could you please repeat that?";
  }

  startListening() {
    console.log('🎤 Starting listening with react-speech-recognition');
    try {
      SpeechRecognition.startListening({ 
        continuous: true,
        language: 'en-US'
      });
      this.isListening = true;
      console.log('🎤 Started listening successfully');
    } catch (error) {
      console.error('🎤 Error starting recognition:', error);
    }
  }

  stopListening() {
    if (this.isListening) {
      SpeechRecognition.stopListening();
      this.isListening = false;
      console.log('🎤 Stopped listening');
    }
  }

  async startInterview({ position, candidateName, questions, sessionId }) {
    try {
      this.currentContext = { position, candidateName, questions };
      this.jarvisProcess = sessionId;
      this.isActive = true;
      
      // Send initial greeting
      const greeting = `Hi ${candidateName}! I'm your AI interviewer for the ${position} position. Are you ready to begin?`;
      await this.speak(greeting);
      
      console.log('🎙️ Interview started with Jarvis');
      return true;
    } catch (error) {
      console.error('Failed to start interview:', error);
      this.isActive = false;
      throw error;
    }
  }

  async speak(text) {
    if (this.onSpeechStart) this.onSpeechStart();
    
    // Stop listening while speaking
    this.stopListening();
    
    // Use Web Speech API for TTS with male voice
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure for male voice like Python Jarvis
      const voices = speechSynthesis.getVoices();
      const maleVoice = voices.find(voice => 
        voice.name.includes('David') || 
        voice.name.includes('Male') ||
        voice.name.includes('Mark') ||
        (voice.name.includes('Microsoft') && voice.name.includes('David')) ||
        voice.gender === 'male'
      );
      
      if (maleVoice) {
        utterance.voice = maleVoice;
        console.log('🎤 Using male voice:', maleVoice.name);
      }
      
      utterance.rate = 0.85;  // Slightly slower for clarity
      utterance.pitch = 0.8;  // Lower pitch for masculine tone
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        if (this.onSpeechEnd) this.onSpeechEnd();
        // Resume listening after speaking
        if (this.isActive && !this.isMuted) {
          setTimeout(() => {
            console.log('🎤 Restarting listening after AI speech...');
            this.startListening();
          }, 500);
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
    if (muted) {
      this.stopListening();
    } else if (this.isActive) {
      this.startListening();
    }
  }

  stop() {
    this.isActive = false;
    this.stopListening();
    SpeechRecognition.abortListening();
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    console.log('🛑 Interview stopped');
  }

  setCallbacks({ onTranscript, onError }) {
    this.onTranscript = onTranscript;
    this.onError = onError;
  }

  async cleanup() {
    this.stop();
    this.jarvisProcess = null;
  }
}

export default new JarvisVoiceService();