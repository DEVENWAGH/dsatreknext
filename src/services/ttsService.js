class TTSService {
  constructor() {
    this.synthesis = null;
    this.isSpeaking = false;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
  }

  initialize() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      return true;
    }
    return false;
  }

  async speak(text) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (this.onSpeechStart) this.onSpeechStart();
        console.log('🔊 Jarvis speaking:', text);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.onSpeechEnd) this.onSpeechEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        reject(event.error);
      };

      this.synthesis.speak(utterance);
    });
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  setCallbacks({ onSpeechStart, onSpeechEnd }) {
    this.onSpeechStart = onSpeechStart;
    this.onSpeechEnd = onSpeechEnd;
  }
}

export default new TTSService();