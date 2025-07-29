// Voice AI Interview Service using Vapi
let Vapi;
try {
  Vapi = require('@vapi-ai/web').default || require('@vapi-ai/web');
} catch (importError) {
  Vapi = null;
}

class VoiceInterviewService {
  constructor() {
    this.vapi = null;
    this.isConnected = false;
    this.currentQuestion = 0;
    this.questions = [];
    this.responses = [];
    this.interviewId = null;
    this.callbacks = {};
  }

  // Initialize Vapi with API key
  initialize(apiKey) {
    if (!Vapi) {
      return false;
    }

    if (!apiKey) {
      return false;
    }

    try {
      this.vapi = new Vapi(apiKey);
      this.setupEventListeners();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Setup event listeners for Vapi
  setupEventListeners() {
    if (!this.vapi) return;

    this.vapi.on('call-start', () => {
      this.isConnected = true;
      this.callbacks.onConnectionChange?.(true);
      this.startInterview();
    });

    this.vapi.on('call-end', () => {
      this.isConnected = false;
      this.callbacks.onConnectionChange?.(false);
      this.callbacks.onInterviewEnd?.(this.responses);
    });

    this.vapi.on('speech-start', () => {
      this.callbacks.onSpeechStart?.();
    });

    this.vapi.on('speech-end', () => {
      this.callbacks.onSpeechEnd?.();
    });

    this.vapi.on('message', message => {
      this.handleMessage(message);
    });

    this.vapi.on('error', error => {
      this.callbacks.onError?.(error);
    });

    this.vapi.on('volume-level', volume => {
      this.callbacks.onVolumeLevel?.(volume);
    });
  }

  // Handle messages from Vapi
  handleMessage(message) {
    if (message.type === 'transcript' && message.transcriptType === 'final') {
      const userResponse = message.transcript;
      this.recordResponse(userResponse);

      // Move to next question after a short delay
      setTimeout(() => {
        this.askNextQuestion();
      }, 1000);
    }
  }

  // Record user response
  recordResponse(response) {
    if (this.questions[this.currentQuestion]) {
      this.responses.push({
        question: this.questions[this.currentQuestion].question,
        questionId: this.currentQuestion,
        response: response,
        timestamp: new Date().toISOString(),
      });

      this.callbacks.onResponseRecorded?.(response, this.currentQuestion);
    }
  }

  // Create assistant configuration for Vapi
  createAssistantConfig(interviewData) {
    const questions =
      interviewData.questions || interviewData.generatedQuestions || [];
    const questionText = questions
      .map((q, i) => `${i + 1}. ${typeof q === 'string' ? q : q.question}`)
      .join('\n');

    return {
      name: `${interviewData.position} Interview Assistant`,
      model: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 150,
      },
      voice: {
        provider: '11labs',
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
        stability: 0.5,
        similarityBoost: 0.8,
      },
      firstMessage: `Hello! Welcome to your ${interviewData.position} interview. I'm your AI interviewer today. Let's begin with our first question. Take your time to think and answer naturally.`,
      systemMessage: `You are conducting a professional ${interviewData.interviewType} interview for a ${interviewData.position} role. 

Interview Questions:
${questionText}

Guidelines:
- Ask questions one by one in order
- Wait for complete responses before moving to the next question
- Be encouraging and professional
- After each response, briefly acknowledge it and move to the next question
- At the end, thank the candidate and end the interview
- Keep responses concise and natural
- Don't repeat questions unless asked
- If the candidate asks for clarification, provide it briefly

Current interview difficulty: ${interviewData.difficulty}
Expected duration: ${interviewData.duration}

Remember to maintain a professional but friendly tone throughout the interview.`,
      recordingEnabled: true,
      endCallMessage:
        "Thank you for your time. This concludes our interview. You did great! We'll be in touch with feedback soon.",
      endCallPhrases: [
        'goodbye',
        'end interview',
        "that's all",
        'finish interview',
      ],
      backgroundSound: 'office',
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en-US',
      },
      functions: [],
    };
  }

  // Start the interview
  async startInterviewCall(interviewData, callbacks = {}) {
    if (!this.vapi) {
      throw new Error('Vapi not initialized');
    }

    this.callbacks = callbacks;
    this.questions =
      interviewData.questions || interviewData.generatedQuestions || [];
    this.responses = [];
    this.currentQuestion = 0;
    this.interviewId = interviewData.id;

    if (this.questions.length === 0) {
      throw new Error('No questions available for interview');
    }

    try {
      const assistantConfig = this.createAssistantConfig(interviewData);

      // Start the call with assistant configuration
      await this.vapi.start(assistantConfig);

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Start asking questions
  startInterview() {
    setTimeout(() => {
      this.askQuestion(0);
    }, 2000); // Give time for the greeting
  }

  // Ask a specific question
  askQuestion(questionIndex) {
    if (questionIndex >= this.questions.length) {
      this.endInterview();
      return;
    }

    this.currentQuestion = questionIndex;
    const question = this.questions[questionIndex];
    const questionText =
      typeof question === 'string' ? question : question.question;

    // Send message to assistant to ask the question
    this.vapi.send({
      type: 'add-message',
      message: {
        role: 'assistant',
        content: `Question ${questionIndex + 1}: ${questionText}`,
      },
    });

    this.callbacks.onQuestionAsked?.(questionText, questionIndex);
  }

  // Ask next question
  askNextQuestion() {
    const nextIndex = this.currentQuestion + 1;
    if (nextIndex < this.questions.length) {
      setTimeout(() => {
        this.askQuestion(nextIndex);
      }, 1500); // Short delay between questions
    } else {
      setTimeout(() => {
        this.endInterview();
      }, 2000);
    }
  }

  // End the interview
  endInterview() {
    if (this.vapi && this.isConnected) {
      this.vapi.stop();
    }

    this.callbacks.onInterviewCompleted?.(this.responses);
  }

  // Stop the interview
  stop() {
    if (this.vapi && this.isConnected) {
      this.vapi.stop();
    }
  }

  // Mute/unmute microphone
  setMuted(muted) {
    if (this.vapi && this.isConnected) {
      this.vapi.setMuted(muted);
    }
  }

  // Get interview progress
  getProgress() {
    return {
      currentQuestion: this.currentQuestion,
      totalQuestions: this.questions.length,
      progress:
        this.questions.length > 0
          ? ((this.currentQuestion + 1) / this.questions.length) * 100
          : 0,
      responses: this.responses,
    };
  }

  // Check if interview is active
  isActive() {
    return this.isConnected;
  }

  // Clean up
  cleanup() {
    if (this.vapi) {
      this.vapi.stop();
      this.vapi = null;
    }
    this.isConnected = false;
    this.currentQuestion = 0;
    this.questions = [];
    this.responses = [];
    this.callbacks = {};
  }
}

// Singleton instance
const voiceInterviewService = new VoiceInterviewService();

export default voiceInterviewService;

// Additional utility functions for voice interview
export const createInterviewSession = interviewData => {
  return {
    id: interviewData.id,
    position: interviewData.position || interviewData.jobPosition,
    company: interviewData.companyName,
    type: interviewData.interviewType,
    difficulty: interviewData.difficulty || interviewData.interviewDifficulty,
    duration: interviewData.duration,
    questions:
      interviewData.questions || interviewData.generatedQuestions || [],
    startTime: new Date().toISOString(),
    status: 'in_progress',
  };
};

export const formatInterviewDuration = seconds => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculateInterviewScore = responses => {
  if (!responses || responses.length === 0) return 0;

  // Simple scoring based on response length and completeness
  const avgResponseLength =
    responses.reduce((sum, r) => sum + (r.response?.length || 0), 0) /
    responses.length;
  const completionRate =
    responses.filter(r => r.response && r.response.trim().length > 10).length /
    responses.length;

  // Score out of 10
  const lengthScore = Math.min(avgResponseLength / 100, 1) * 5; // Max 5 points for length
  const completionScore = completionRate * 5; // Max 5 points for completion

  return Math.round(lengthScore + completionScore);
};
