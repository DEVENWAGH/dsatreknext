import { createClient } from '@deepgram/sdk';

class DeepgramVoiceAgent {
  constructor(apiKey) {
    this.deepgram = createClient(apiKey);
    this.connection = null;
    this.isConnected = false;
    this.audioBuffer = Buffer.alloc(0);
    this.conversationLog = [];
    this.onConversationUpdate = null;
    this.onAudioReceived = null;
    this.onError = null;
    this.fileCounter = 0;
  }

  async startVoiceInterview(interviewConfig) {
    try {
      this.connection = this.deepgram.agent();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Configure the agent for interview
      const config = this.getInterviewConfiguration(interviewConfig);
      
      // Wait for welcome message then configure
      this.connection.on('Welcome', () => {
        console.log('Welcome to Deepgram Voice Agent Interview!');
        this.connection.configure(config);
        this.isConnected = true;
      });

      return new Promise((resolve, reject) => {
        this.connection.on('Open', () => {
          console.log('Voice interview connection opened');
          resolve(true);
        });

        this.connection.on('Error', (error) => {
          console.error('Voice interview connection error:', error);
          reject(error);
        });

        // Start keep-alive to maintain connection
        this.startKeepAlive();
      });

    } catch (error) {
      console.error('Failed to start voice interview:', error);
      throw error;
    }
  }

  getInterviewConfiguration(interviewConfig) {
    const { position, interviewType, language = 'english' } = interviewConfig;

    // Create interview-specific prompt
    const interviewPrompt = this.createInterviewPrompt(position, interviewType, language);

    return {
      audio: {
        input: {
          encoding: "linear16",
          sample_rate: 24000,
        },
        output: {
          encoding: "linear16",
          sample_rate: 16000,
          container: "wav",
        },
      },
      agent: {
        language: language === 'hindi' ? 'hi' : 'en',
        listen: {
          provider: {
            type: "deepgram",
            model: "nova-3",
          },
        },
        think: {
          provider: {
            type: "open_ai",
            model: "gpt-4o-mini",
          },
          prompt: interviewPrompt,
        },
        speak: {
          provider: {
            type: "deepgram",
            model: language === 'hindi' ? "aura-2-kara-en" : "aura-2-thalia-en",
          },
        },
        greeting: this.getGreeting(language, position),
      },
    };
  }

  createInterviewPrompt(position, interviewType, language) {
    const basePrompt = language === 'hindi' 
      ? `आप एक अनुभवी तकनीकी इंटरव्यूअर हैं। आप ${position} पद के लिए ${interviewType} इंटरव्यू ले रहे हैं।`
      : `You are an experienced technical interviewer conducting a ${interviewType} interview for a ${position} position.`;

    const instructions = language === 'hindi'
      ? `निर्देश:
- हिंदी में बातचीत करें
- प्रश्न क्रमबद्ध रूप से पूछें
- उम्मीदवार के उत्तरों के आधार पर फॉलो-अप प्रश्न पूछें
- प्रोत्साहित करें और पेशेवर बने रहें
- प्रत्येक उत्तर पर 2-3 मिनट का समय दें
- कुल इंटरव्यू 30-45 मिनट का रखें`
      : `Instructions:
- Conduct the interview in English
- Ask questions in a structured manner
- Ask follow-up questions based on candidate responses  
- Be encouraging and professional
- Allow 2-3 minutes per answer
- Keep total interview duration to 30-45 minutes`;

    return `${basePrompt}\n\n${instructions}`;
  }

  getGreeting(language, position) {
    return language === 'hindi' 
      ? `नमस्कार! मैं आपका AI इंटरव्यूअर हूं। आज हम ${position} पद के लिए इंटरव्यू करेंगे। क्या आप तैयार हैं?`
      : `Hello! I'm your AI interviewer. Today we'll be conducting an interview for the ${position} position. Are you ready to begin?`;
  }

  setupEventHandlers() {
    // Handle conversation text
    this.connection.on('ConversationText', (data) => {
      console.log('Conversation:', data);
      this.conversationLog.push({
        role: data.role,
        content: data.content,
        timestamp: new Date().toISOString()
      });
      
      if (this.onConversationUpdate) {
        this.onConversationUpdate(data);
      }
    });

    // Handle audio from agent
    this.connection.on('Audio', (data) => {
      console.log('Audio chunk received');
      const buffer = Buffer.from(data);
      this.audioBuffer = Buffer.concat([this.audioBuffer, buffer]);
      
      if (this.onAudioReceived) {
        this.onAudioReceived(buffer);
      }
    });

    // Handle agent audio completion
    this.connection.on('AgentAudioDone', () => {
      console.log('Agent finished speaking');
      this.saveAudioFile();
      this.audioBuffer = Buffer.alloc(0);
      this.fileCounter++;
    });

    // Handle user speaking events
    this.connection.on('UserStartedSpeaking', () => {
      console.log('User started speaking');
      if (this.audioBuffer.length) {
        console.log('Interrupting agent audio');
        this.audioBuffer = Buffer.alloc(0);
      }
    });

    // Handle agent thinking
    this.connection.on('AgentThinking', (data) => {
      console.log('Agent is thinking:', data);
    });

    // Handle agent started speaking
    this.connection.on('AgentStartedSpeaking', (data) => {
      console.log('Agent started speaking:', data);
      this.audioBuffer = Buffer.alloc(0); // Reset buffer for new response
    });

    // Handle errors
    this.connection.on('Error', (error) => {
      console.error('Voice agent error:', error);
      if (this.onError) {
        this.onError(error);
      }
    });

    // Handle connection close
    this.connection.on('Close', () => {
      console.log('Voice interview connection closed');
      this.isConnected = false;
    });

    // Handle metadata
    this.connection.on('Metadata', (data) => {
      console.log('Metadata received:', data);
    });

    // Handle unhandled events
    this.connection.on('Unhandled', (data) => {
      console.log('Unhandled event:', data);
    });
  }

  startKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }

    this.keepAliveInterval = setInterval(() => {
      if (this.connection && this.isConnected) {
        console.log('Sending keep alive');
        this.connection.keepAlive();
      }
    }, 5000);
  }

  sendAudioChunk(audioData) {
    if (this.connection && this.isConnected) {
      this.connection.send(audioData);
    }
  }

  saveAudioFile() {
    if (this.audioBuffer.length > 0) {
      // In a real implementation, you'd save this to a file or send to storage
      console.log(`Audio response saved: ${this.audioBuffer.length} bytes`);
      
      // You could save to local storage, upload to cloud storage, etc.
      // For now, we'll just log the size
    }
  }

  getConversationTranscript() {
    return this.conversationLog;
  }

  async endInterview() {
    try {
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }

      if (this.connection) {
        this.connection.finish();
        this.connection = null;
      }

      this.isConnected = false;
      
      // Return final interview data
      return {
        transcript: this.conversationLog,
        duration: this.calculateInterviewDuration(),
        audioFiles: this.fileCounter,
        success: true
      };
    } catch (error) {
      console.error('Error ending interview:', error);
      throw error;
    }
  }

  calculateInterviewDuration() {
    if (this.conversationLog.length === 0) return 0;
    
    const startTime = new Date(this.conversationLog[0].timestamp);
    const endTime = new Date(this.conversationLog[this.conversationLog.length - 1].timestamp);
    
    return Math.round((endTime - startTime) / 1000 / 60); // Duration in minutes
  }

  // Event handlers setters
  setOnConversationUpdate(callback) {
    this.onConversationUpdate = callback;
  }

  setOnAudioReceived(callback) {
    this.onAudioReceived = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }
}

export default DeepgramVoiceAgent;
