class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.onTranscript = null;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onError = null;
  }

  async initialize() {
    try {
      // Initialize Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          
          if (this.onTranscript) {
            this.onTranscript({
              transcript,
              isFinal: event.results[event.results.length - 1].isFinal
            });
          }
        };

        this.recognition.onerror = (event) => {
          if (this.onError) this.onError(event.error);
        };
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }

      return true;
    } catch (error) {
      console.error('Voice service initialization failed:', error);
      return false;
    }
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
      console.log('🎤 Started listening');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('🎤 Stopped listening');
    }
  }

  async speak(text) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Stop any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (this.onSpeechStart) this.onSpeechStart();
        console.log('🔊 AI started speaking');
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.onSpeechEnd) this.onSpeechEnd();
        console.log('🔊 AI finished speaking');
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        if (this.onError) this.onError(event.error);
        reject(event.error);
      };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  setCallbacks({ onTranscript, onSpeechStart, onSpeechEnd, onError }) {
    this.onTranscript = onTranscript;
    this.onSpeechStart = onSpeechStart;
    this.onSpeechEnd = onSpeechEnd;
    this.onError = onError;
  }

  destroy() {
    this.stopListening();
    this.stopSpeaking();
    this.recognition = null;
    this.synthesis = null;
  }
}

export default new VoiceService();