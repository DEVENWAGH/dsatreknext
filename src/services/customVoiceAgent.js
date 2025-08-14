import { createClient } from '@deepgram/sdk';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { PromptTemplate } from '@langchain/core/prompts';

class CustomVoiceAgent {
  constructor({ deepgramApiKey, geminiApiKey }) {
    // Initialize Deepgram client for STT and TTS
    this.deepgram = createClient(deepgramApiKey);

    // Initialize Gemini AI with LangChain
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: geminiApiKey,
      modelName: 'gemini-1.5-pro',
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    // Initialize conversation memory
    this.memory = new BufferMemory();

    // Set up conversation chain
    this.conversationChain = null;

    // Audio handling
    this.isListening = false;
    this.isSpeaking = false;
    this.liveConnection = null;
    this.audioContext = null;
    this.mediaStream = null;

    // Interview state
    this.conversationLog = [];
    this.isInitialized = false;
    this.status = 'idle';

    // Event callbacks
    this.onConversationUpdate = null;
    this.onStatusChange = null;
    this.onError = null;

    // Interview configuration
    this.interviewConfig = null;
  }

  async initialize(interviewConfig) {
    try {
      this.interviewConfig = interviewConfig;

      // Create interview-specific prompt template
      const promptTemplate = this.createInterviewPrompt(interviewConfig);

      // Initialize conversation chain with memory
      this.conversationChain = new ConversationChain({
        llm: this.llm,
        memory: this.memory,
        prompt: promptTemplate,
        verbose: false,
      });

      // Initialize audio context
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      this.isInitialized = true;
      this.updateStatus('initialized');

      return true;
    } catch (error) {
      console.error('Failed to initialize custom voice agent:', error);
      this.handleError('Failed to initialize voice agent', error);
      return false;
    }
  }

  createInterviewPrompt(interviewConfig) {
    const {
      position,
      interviewType,
      language = 'english',
      difficulty = 'medium',
    } = interviewConfig;

    const basePrompt =
      language === 'hindi'
        ? `आप एक अनुभवी और दयालु तकनीकी इंटरव्यूअर हैं। आप ${position} पद के लिए ${interviewType} इंटरव्यू ले रहे हैं।`
        : `You are an experienced and friendly technical interviewer conducting a ${interviewType} interview for a ${position} position.`;

    const instructions =
      language === 'hindi'
        ? `निर्देश:
- हिंदी में बातचीत करें
- प्रश्न क्रमबद्ध रूप से पूछें
- उम्मीदवार के उत्तरों के आधार पर फॉलो-अप प्रश्न पूछें
- प्रोत्साहित करें और पेशेवर बने रहें
- प्रत्येक उत्तर पर 2-3 मिनट का समय दें
- कुल इंटरव्यू 30-45 मिनट का रखें
- छोटे और स्पष्ट वाक्य बोलें
- एक समय में केवल एक प्रश्न पूछें`
        : `Instructions:
- Conduct the interview in English
- Ask questions in a structured manner
- Ask follow-up questions based on candidate responses  
- Be encouraging and professional
- Allow 2-3 minutes per answer
- Keep total interview duration to 30-45 minutes
- Speak in short, clear sentences
- Ask only one question at a time
- Wait for complete responses before proceeding`;

    const difficultyNote =
      language === 'hindi'
        ? `\nकठिनाई स्तर: ${difficulty === 'easy' ? 'आसान' : difficulty === 'hard' ? 'कठिन' : 'मध्यम'}`
        : `\nDifficulty Level: ${difficulty}`;

    const conversationFormat =
      language === 'hindi'
        ? `\nबातचीत प्रारूप:
Current conversation:
{history}
Human: {input}
AI Interviewer:`
        : `\nConversation Format:
Current conversation:
{history}
Human: {input}
AI Interviewer:`;

    return PromptTemplate.fromTemplate(
      `${basePrompt}\n\n${instructions}${difficultyNote}${conversationFormat}`
    );
  }

  async startInterview() {
    try {
      if (!this.isInitialized) {
        throw new Error('Voice agent not initialized');
      }

      this.updateStatus('starting');

      // Start microphone access
      await this.startMicrophone();

      // Initialize Deepgram STT connection
      await this.initializeSTT();

      // Send initial greeting
      await this.sendInitialGreeting();

      this.updateStatus('active');

      return true;
    } catch (error) {
      console.error('Failed to start interview:', error);
      this.handleError('Failed to start interview', error);
      return false;
    }
  }

  async startMicrophone() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (error) {
      throw new Error('Microphone access denied');
    }
  }

  async initializeSTT() {
    try {
      this.liveConnection = this.deepgram.listen.live({
        model: 'nova-2',
        language: this.interviewConfig.language === 'hindi' ? 'hi' : 'en-US',
        smart_format: true,
        interim_results: true,
        endpointing: 300,
      });

      // Handle transcription results
      this.liveConnection.on('Results', async data => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;

        if (transcript && transcript.trim()) {
          if (data.is_final) {
            await this.handleUserSpeech(transcript);
          }
        }
      });

      // Handle connection events
      this.liveConnection.on('Open', () => {
        console.log('Deepgram STT connection opened');
        this.startListening();
      });

      this.liveConnection.on('Error', error => {
        console.error('Deepgram STT error:', error);
        this.handleError('Speech recognition error', error);
      });

      this.liveConnection.on('Close', () => {
        console.log('Deepgram STT connection closed');
      });
    } catch (error) {
      throw new Error('Failed to initialize speech recognition');
    }
  }

  startListening() {
    if (this.mediaStream && this.liveConnection && !this.isListening) {
      this.isListening = true;
      this.updateStatus('listening');

      // Send audio data to Deepgram
      const source = this.audioContext.createMediaStreamSource(
        this.mediaStream
      );
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = event => {
        if (this.isListening && this.liveConnection) {
          const inputBuffer = event.inputBuffer.getChannelData(0);
          const int16Array = new Int16Array(inputBuffer.length);

          for (let i = 0; i < inputBuffer.length; i++) {
            int16Array[i] = Math.max(
              -32768,
              Math.min(32767, inputBuffer[i] * 32768)
            );
          }

          this.liveConnection.send(int16Array.buffer);
        }
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);

      this.audioProcessor = processor;
      this.audioSource = source;
    }
  }

  stopListening() {
    if (this.isListening) {
      this.isListening = false;

      if (this.audioProcessor) {
        this.audioProcessor.disconnect();
        this.audioProcessor = null;
      }

      if (this.audioSource) {
        this.audioSource.disconnect();
        this.audioSource = null;
      }

      this.updateStatus('processing');
    }
  }

  async handleUserSpeech(transcript) {
    try {
      this.stopListening();

      // Add user message to conversation log
      const userMessage = {
        role: 'user',
        content: transcript,
        timestamp: new Date().toISOString(),
      };

      this.conversationLog.push(userMessage);
      this.notifyConversationUpdate(userMessage);

      // Generate AI response using Gemini
      this.updateStatus('thinking');
      const aiResponse = await this.generateAIResponse(transcript);

      // Add AI response to conversation log
      const aiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      this.conversationLog.push(aiMessage);
      this.notifyConversationUpdate(aiMessage);

      // Convert AI response to speech
      await this.speak(aiResponse);
    } catch (error) {
      console.error('Error handling user speech:', error);
      this.handleError('Error processing speech', error);
    }
  }

  async generateAIResponse(userInput) {
    try {
      const response = await this.conversationChain.call({
        input: userInput,
      });

      return response.response;
    } catch (error) {
      console.error('Error generating AI response:', error);

      // Fallback response
      const fallback =
        this.interviewConfig.language === 'hindi'
          ? 'क्षमा करें, मुझे समझने में कुछ समस्या हुई। कृपया अपना उत्तर दोहराएं।'
          : 'I apologize, I had trouble understanding. Could you please repeat your answer?';

      return fallback;
    }
  }

  async speak(text) {
    try {
      this.isSpeaking = true;
      this.updateStatus('speaking');

      // Use Deepgram TTS to generate audio
      const response = await this.deepgram.speak.request(
        { text },
        {
          model:
            this.interviewConfig.language === 'hindi'
              ? 'aura-kara-en'
              : 'aura-asteria-en',
          encoding: 'linear16',
          sample_rate: 24000,
        }
      );

      const audioBuffer = await response.arrayBuffer();

      // Play the audio
      await this.playAudio(audioBuffer);

      this.isSpeaking = false;

      // Resume listening after speaking
      setTimeout(() => {
        this.startListening();
      }, 500);
    } catch (error) {
      console.error('Error generating speech:', error);
      this.isSpeaking = false;
      this.handleError('Error generating speech', error);

      // Resume listening even on error
      setTimeout(() => {
        this.startListening();
      }, 1000);
    }
  }

  async playAudio(audioBuffer) {
    return new Promise((resolve, reject) => {
      try {
        this.audioContext.decodeAudioData(
          audioBuffer,
          buffer => {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);

            source.onended = () => {
              resolve();
            };

            source.start(0);
          },
          error => {
            reject(error);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async sendInitialGreeting() {
    const greeting = this.getInitialGreeting();

    const greetingMessage = {
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toISOString(),
    };

    this.conversationLog.push(greetingMessage);
    this.notifyConversationUpdate(greetingMessage);

    await this.speak(greeting);
  }

  getInitialGreeting() {
    const { position, language } = this.interviewConfig;

    return language === 'hindi'
      ? `नमस्कार! मैं आपका AI इंटरव्यूअर हूं। आज हम ${position} पद के लिए इंटरव्यू करेंगे। क्या आप तैयार हैं?`
      : `Hello! I'm your AI interviewer. Today we'll be conducting an interview for the ${position} position. Are you ready to begin?`;
  }

  async endInterview() {
    try {
      this.updateStatus('ending');

      // Stop listening
      this.stopListening();

      // Close STT connection
      if (this.liveConnection) {
        this.liveConnection.finish();
        this.liveConnection = null;
      }

      // Stop media stream
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      // Close audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }

      this.updateStatus('ended');

      return {
        transcript: this.conversationLog,
        duration: this.calculateDuration(),
        success: true,
      };
    } catch (error) {
      console.error('Error ending interview:', error);
      this.handleError('Error ending interview', error);
      throw error;
    }
  }

  calculateDuration() {
    if (this.conversationLog.length === 0) return 0;

    const startTime = new Date(this.conversationLog[0].timestamp);
    const endTime = new Date(
      this.conversationLog[this.conversationLog.length - 1].timestamp
    );

    return Math.round((endTime - startTime) / 1000 / 60); // Duration in minutes
  }

  getTranscript() {
    return this.conversationLog.map(msg => ({
      speaker: msg.role === 'user' ? 'Candidate' : 'Interviewer',
      content: msg.content,
      timestamp: msg.timestamp,
    }));
  }

  getStats() {
    const userMessages = this.conversationLog.filter(
      msg => msg.role === 'user'
    );
    const assistantMessages = this.conversationLog.filter(
      msg => msg.role === 'assistant'
    );

    return {
      totalMessages: this.conversationLog.length,
      candidateResponses: userMessages.length,
      interviewerQuestions: assistantMessages.length,
      averageResponseLength:
        userMessages.length > 0
          ? Math.round(
              userMessages.reduce((acc, msg) => acc + msg.content.length, 0) /
                userMessages.length
            )
          : 0,
      duration: this.calculateDuration(),
    };
  }

  // Event handling
  updateStatus(newStatus) {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }

  notifyConversationUpdate(message) {
    if (this.onConversationUpdate) {
      this.onConversationUpdate(message);
    }
  }

  handleError(message, error) {
    const errorData = {
      message,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    };

    if (this.onError) {
      this.onError(errorData);
    }
  }

  // Event handler setters
  setOnConversationUpdate(callback) {
    this.onConversationUpdate = callback;
  }

  setOnStatusChange(callback) {
    this.onStatusChange = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }
}

export default CustomVoiceAgent;
