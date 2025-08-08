import { GoogleGenerativeAI } from '@google/generative-ai';

class DeepgramVoiceAgent {
  constructor(config) {
    this.deepgramApiKey = config.deepgramApiKey;
    this.geminiApiKey = config.geminiApiKey;
    this.interviewConfig = null;

    // State
    this.isInitialized = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.conversation = [];
    this.mediaRecorder = null;
    this.audioContext = null;
    this.deepgramSocket = null;
    this.currentAudio = null;
    this.interimTimeout = null;
    this.isProcessing = false;
    this.lastInterimTranscript = null;

    // Callbacks
    this.onConversationUpdate = null;
    this.onStatusChange = null;
    this.onError = null;

    // Initialize Gemini
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });
  }

  setOnConversationUpdate(callback) {
    this.onConversationUpdate = callback;
  }

  setOnStatusChange(callback) {
    this.onStatusChange = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }

  async initialize(interviewConfig) {
    try {
      if (
        !this.geminiApiKey ||
        this.geminiApiKey === 'your_gemini_api_key_here'
      ) {
        throw new Error('Gemini API key not configured');
      }
      if (
        !this.deepgramApiKey ||
        this.deepgramApiKey === 'your_deepgram_api_key_here'
      ) {
        throw new Error('Deepgram API key not configured');
      }

      this.interviewConfig = interviewConfig;
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.isInitialized = true;
      this.updateStatus('initialized');
      return true;
    } catch (error) {
      this.handleError('Initialization failed', error);
      return false;
    }
  }

  async startInterview() {
    if (!this.isInitialized) return false;

    try {
      this.updateStatus('active');

      // Start with AI greeting
      const greeting = await this.generateGreeting();
      this.addToConversation('assistant', greeting);
      await this.speak(greeting);

      // Start listening after greeting
      setTimeout(() => this.startListening(), 1000);

      return true;
    } catch (error) {
      this.handleError('Failed to start interview', error);
      return false;
    }
  }

  async generateGreeting() {
    try {
      const questionCount = this.interviewConfig.questions?.length || 0;

      const prompt = `You are an AI interviewer for a ${this.interviewConfig.position} position at ${this.interviewConfig.companyName}. 
      This is a ${this.interviewConfig.interviewType} interview lasting ${this.interviewConfig.duration}.
      
      Generate a brief, professional greeting (2-3 sentences) to start the interview. Be warm but professional.
      Mention that you have ${questionCount} questions prepared specifically for the ${this.interviewConfig.position} role.
      Candidate name: ${this.interviewConfig.candidateName}`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return `Hello ${this.interviewConfig.candidateName}, welcome to your ${this.interviewConfig.position} interview. I'm your AI interviewer and I'll be asking you some questions today. Let's begin!`;
    }
  }

  async startListening() {
    if (this.isListening) return;

    try {
      // Reuse existing stream or create new one
      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      this.isListening = true;
      this.updateStatus('listening');

      // Only create new WebSocket if not already connected
      if (
        !this.deepgramSocket ||
        this.deepgramSocket.readyState !== WebSocket.OPEN
      ) {
        this.deepgramSocket = new WebSocket(
          `wss://api.deepgram.com/v1/listen?model=nova-3&language=en-IN&smart_format=true&interim_results=true&endpointing=1000&vad_events=true&utterance_end_ms=1500`,
          ['token', this.deepgramApiKey]
        );

        this.deepgramSocket.onopen = () => {
          console.log(
            '🎤 Deepgram WebSocket connected - listening for speech...'
          );
          this.updateStatus('listening');

          // Set up MediaRecorder only if not already created
          if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
            this.mediaRecorder = new MediaRecorder(this.mediaStream, {
              mimeType: 'audio/webm;codecs=opus',
            });

            this.mediaRecorder.ondataavailable = event => {
              if (
                event.data.size > 0 &&
                this.deepgramSocket.readyState === WebSocket.OPEN
              ) {
                this.deepgramSocket.send(event.data);
              }
            };

            this.mediaRecorder.start(50); // Send data every 50ms for better responsiveness
          } else if (this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
          }
        };

        this.deepgramSocket.onmessage = async message => {
          const data = JSON.parse(message.data);

          // Handle speech activity detection
          if (data.type === 'SpeechStarted') {
            console.log('🎤 User started speaking');
          }

          if (data.type === 'UtteranceEnd') {
            console.log('🔇 User finished speaking');
            // Don't process immediately - wait for final transcript or reasonable timeout
          }

          if (data.channel?.alternatives?.[0]?.transcript) {
            const transcript = data.channel.alternatives[0].transcript;

            // Show interim results for better UX
            if (!data.is_final && transcript.trim()) {
              console.log('🎤 Interim:', transcript);

              // Store last interim transcript
              this.lastInterimTranscript = transcript;

              // Clear any existing timeout
              if (this.interimTimeout) {
                clearTimeout(this.interimTimeout);
              }

              // Set reasonable timeout to process speech
              this.interimTimeout = setTimeout(() => {
                if (
                  transcript.trim() &&
                  transcript.length > 1 &&
                  !this.isProcessing
                ) {
                  console.log(
                    '⏰ Processing interim as final (timeout):',
                    transcript
                  );
                  this.processUserSpeech(transcript);
                  this.lastInterimTranscript = null;
                }
              }, 2000); // 2 second timeout
            }

            if (data.is_final && transcript.trim() && transcript.length > 1) {
              console.log('🗣️ User said (final):', transcript);

              // Clear interim timeout
              if (this.interimTimeout) {
                clearTimeout(this.interimTimeout);
                this.interimTimeout = null;
              }

              this.processUserSpeech(transcript);
            }
          }
        };

        this.deepgramSocket.onerror = error => {
          this.handleError('Deepgram connection error', error);
        };
      } else {
        // WebSocket already connected, just resume recording
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
          this.mediaRecorder.resume();
        }
      }
    } catch (error) {
      this.handleError('Failed to start listening', error);
    }
  }

  pauseListening() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
    this.updateStatus('processing');
  }

  resumeListening() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.updateStatus('listening');
    } else {
      // Restart listening if needed
      this.startListening();
    }
  }

  stopListening() {
    if (!this.isListening) return;

    this.isListening = false;
    this.updateStatus('ready');

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (
      this.deepgramSocket &&
      this.deepgramSocket.readyState === WebSocket.OPEN
    ) {
      this.deepgramSocket.close();
    }
  }

  async processUserSpeech(transcript) {
    // Prevent duplicate processing
    if (this.isProcessing) {
      console.log('🚫 Already processing, ignoring:', transcript);
      return;
    }

    this.isProcessing = true;

    // Stop AI speech immediately if user is speaking
    if (this.isSpeaking) {
      console.log('🛑 User speaking - stopping AI speech immediately');
      this.interruptSpeech();
    }

    this.updateStatus('processing');

    // Add user message to conversation
    console.log('➕ Adding user message to conversation');
    this.addToConversation('user', transcript);

    // Generate AI response
    console.log('🤖 Generating AI response...');
    const response = await this.generateResponse(transcript);

    // Speak the response
    console.log('🔊 AI responding:', response.substring(0, 50) + '...');
    await this.speak(response);

    // Continue listening
    this.updateStatus('listening');
    this.isProcessing = false;
  }

  interruptSpeech() {
    if (this.currentAudio && !this.currentAudio.paused && this.isSpeaking) {
      console.log('🛑 User interrupting - stopping AI speech');
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isSpeaking = false;
      this.updateStatus('listening');
      return true;
    }
    return false;
  }

  async generateResponse(userInput) {
    try {
      const conversationHistory = this.conversation
        .slice(-6)
        .map(
          msg =>
            `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
        )
        .join('\n');

      // Track which questions have been asked
      const askedQuestions = this.conversation
        .filter(msg => msg.role === 'assistant')
        .map(msg => msg.content.toLowerCase());

      // Find next question to ask
      const availableQuestions = this.interviewConfig.questions || [];
      let nextQuestion = null;

      for (const q of availableQuestions) {
        const questionText = (q.question || q.text || q).toLowerCase();
        const isAlreadyAsked = askedQuestions.some(
          asked =>
            asked.includes(questionText.substring(0, 30)) ||
            questionText.includes(asked.substring(0, 30))
        );

        if (!isAlreadyAsked) {
          nextQuestion = q;
          break;
        }
      }

      const questionsContext =
        availableQuestions
          .map((q, i) => {
            const questionText = q.question || q.text || q;
            const category = q.category || q.type || 'General';
            const difficulty = q.difficulty || 'medium';
            return `${i + 1}. [${category} - ${difficulty}] ${questionText}`;
          })
          .join('\n') || '';

      let prompt;

      if (nextQuestion && this.conversation.length <= 2) {
        // First question - ask directly
        const questionText =
          nextQuestion.question || nextQuestion.text || nextQuestion;
        prompt = `You are an AI interviewer talking to ${this.interviewConfig.candidateName}. 
        
${this.interviewConfig.candidateName} just said: "${userInput}"
        
Now ask this specific question: "${questionText}"
        
Speak naturally and conversationally. Use ${this.interviewConfig.candidateName}'s name. Do not use markdown formatting like ** or internal thoughts. Just speak directly as an interviewer would.`;
      } else if (nextQuestion) {
        // Subsequent questions
        const questionText =
          nextQuestion.question || nextQuestion.text || nextQuestion;
        prompt = `You are an AI interviewer talking to ${this.interviewConfig.candidateName}.
        
Conversation so far:
${conversationHistory}
        
${this.interviewConfig.candidateName} just said: "${userInput}"
        
Next, ask this specific question: "${questionText}"
        
Briefly acknowledge their response, then ask the question naturally. Use ${this.interviewConfig.candidateName}'s name. Do not use markdown formatting or show internal thoughts. Speak directly.`;
      } else {
        // All questions asked or follow-up
        prompt = `You are an AI interviewer talking to ${this.interviewConfig.candidateName} for a ${this.interviewConfig.position} position.
        
Conversation History:
${conversationHistory}
        
${this.interviewConfig.candidateName} just said: "${userInput}"
        
All main questions have been covered. Ask a relevant follow-up question about ${this.interviewConfig.position}. Use ${this.interviewConfig.candidateName}'s name. Do not use markdown formatting or show internal analysis. Speak naturally as an interviewer.`;
      }

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      this.addToConversation('assistant', response);
      return response;
    } catch (error) {
      console.error('Gemini API Error:', error);
      const fallbackResponse = `Thank you for that response. Can you tell me more about your experience with ${this.interviewConfig.position} related technologies?`;
      this.addToConversation('assistant', fallbackResponse);
      return fallbackResponse;
    }
  }

  async speak(text) {
    if (this.isSpeaking) return;

    try {
      console.log('🔊 Starting TTS for:', text.substring(0, 30) + '...');
      this.isSpeaking = true;
      this.updateStatus('speaking');

      // Use Deepgram TTS with Indian English model
      const response = await fetch(
        'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${this.deepgramApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) throw new Error('TTS request failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      this.currentAudio = new Audio(audioUrl);

      return new Promise(resolve => {
        // Start listening 2 seconds before AI finishes speaking
        this.currentAudio.addEventListener('timeupdate', () => {
          const remaining =
            this.currentAudio.duration - this.currentAudio.currentTime;
          if (remaining <= 2 && !this.isListening) {
            console.log('🎤 Starting to listen before AI finishes');
            this.startListening();
          }
        });

        this.currentAudio.onended = () => {
          console.log('✅ TTS playback completed');
          this.isSpeaking = false;
          this.updateStatus('ready');
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        // Allow interruption during speech
        this.currentAudio.addEventListener('pause', () => {
          if (this.isSpeaking) {
            this.isSpeaking = false;
            this.updateStatus('listening');
            resolve();
          }
        });

        this.currentAudio.onerror = () => {
          this.isSpeaking = false;
          this.updateStatus('ready');
          this.handleError('Audio playback failed');
          resolve();
        };

        this.currentAudio.play();
      });
    } catch (error) {
      this.isSpeaking = false;
      this.updateStatus('ready');
      this.handleError('Speech synthesis failed', error);
    }
  }

  addToConversation(role, content) {
    const message = {
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    this.conversation.push(message);
    console.log('💬 Added to conversation:', {
      role,
      content: content.substring(0, 50) + '...',
      total: this.conversation.length,
    });

    if (this.onConversationUpdate) {
      this.onConversationUpdate(message);
    }
  }

  updateStatus(status) {
    console.log('🔄 Status changed to:', status);
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  handleError(message, error = null) {
    console.error(message, error);
    if (this.onError) {
      this.onError({ message, error });
    }
  }

  async endInterview() {
    this.stopListening();

    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    // Clean up media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.updateStatus('ended');

    return {
      transcript: this.getTranscript(),
      duration: this.conversation.length,
      totalMessages: this.conversation.length,
      candidateResponses: this.conversation.filter(m => m.role === 'user')
        .length,
      interviewerQuestions: this.conversation.filter(
        m => m.role === 'assistant'
      ).length,
    };
  }

  getTranscript() {
    return this.conversation.map(msg => ({
      speaker: msg.role === 'user' ? 'Candidate' : 'Interviewer',
      content: msg.content,
      timestamp: msg.timestamp,
    }));
  }

  getStats() {
    const userMessages = this.conversation.filter(msg => msg.role === 'user');
    const assistantMessages = this.conversation.filter(
      msg => msg.role === 'assistant'
    );

    return {
      totalMessages: this.conversation.length,
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
  }
}

export default DeepgramVoiceAgent;