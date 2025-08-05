import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getRefererUrl } from '@/utils/environmentUtils';

class LangChainInterviewAgent {
  constructor() {
    this.sessions = new Map();
    this.interviewQuestions = new Map(); // Store interview questions by sessionId
    this.currentQuestionIndex = new Map(); // Track current question index by sessionId
    this.llm = null;
    this.chain = null;
  }

  initialize() {
    // Initialize LangChain ChatOpenAI with OpenRouter
    this.llm = new ChatOpenAI({
      temperature: 0.7,
      modelName: 'openai/gpt-4o',
      apiKey: process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': getRefererUrl(),
          'X-Title': 'DSATrek Interview System',
        },
      },
      maxTokens: 150,
    });

    // Create interview prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are Jarvis, an AI interview conductor. 

Context:
- Position: {position}
- Candidate: {candidateName}
- Interview Type: {interviewType}
- Current Question: {currentQuestion}
- Question {questionNumber} of {totalQuestions}

Guidelines:
- Keep responses brief and professional (under 50 words)
- Ask follow-up questions naturally based on candidate answers
- Be encouraging and supportive
- Guide the conversation through the provided interview questions
- Respond conversationally, not formally
- Remember previous conversation context
- If no question is specified yet, introduce yourself and start with the first question`,
      ],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ]);

    // Create chain with output parser
    this.chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
  }

  getSessionHistory(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new ChatMessageHistory());
    }
    return this.sessions.get(sessionId);
  }

  // Load interview questions from the database
  async loadInterviewQuestions(interviewId, sessionId) {
    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch interview: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Use the correct field name from database - 'questions' not 'generatedQuestions'
        const questions = data.data.questions || [];
        this.interviewQuestions.set(sessionId, questions);
        this.currentQuestionIndex.set(sessionId, 0);
        return data.data;
      } else {
        throw new Error('Interview data structure is invalid');
      }
    } catch (error) {
      console.error('Failed to load interview questions:', error);
      // Fallback questions if database fetch fails
      this.interviewQuestions.set(sessionId, [
        { question: 'What are your key strengths for this position?' },
        { question: "Tell me about a challenging project you've worked on." },
        { question: 'Where do you see yourself in 5 years?' },
      ]);
      this.currentQuestionIndex.set(sessionId, 0);
      return null;
    }
  }

  // Get current question for a session
  getCurrentQuestion(sessionId) {
    const questions = this.interviewQuestions.get(sessionId) || [];
    const index = this.currentQuestionIndex.get(sessionId) || 0;

    if (questions.length > 0 && index < questions.length) {
      // Handle both string and object question formats
      const question = questions[index];
      return typeof question === 'string'
        ? question
        : question.question || question.text;
    }
    return null;
  }

  // Move to next question
  moveToNextQuestion(sessionId) {
    const currentIndex = this.currentQuestionIndex.get(sessionId) || 0;
    const questions = this.interviewQuestions.get(sessionId) || [];

    if (currentIndex + 1 < questions.length) {
      this.currentQuestionIndex.set(sessionId, currentIndex + 1);
      return true;
    }
    return false;
  }

  async chat(message, sessionId, context = {}) {
    if (!this.chain) {
      this.initialize();
    }

    try {
      // Load interview if not already loaded
      if (!this.interviewQuestions.has(sessionId) && context.interviewId) {
        await this.loadInterviewQuestions(context.interviewId, sessionId);
      }

      // Get current question and question count information
      const currentQuestion = this.getCurrentQuestion(sessionId);
      const questions = this.interviewQuestions.get(sessionId) || [];
      const currentIndex = this.currentQuestionIndex.get(sessionId) || 0;

      // Determine if we should move to the next question based on the message
      // This is a simple heuristic - in production you might want more sophisticated logic
      if (
        message.toLowerCase().includes('next question') &&
        currentIndex < questions.length - 1
      ) {
        this.moveToNextQuestion(sessionId);
      }

      // Create runnable with message history
      const withMessageHistory = new RunnableWithMessageHistory({
        runnable: this.chain,
        getMessageHistory: sessionId => this.getSessionHistory(sessionId),
        inputMessagesKey: 'input',
        historyMessagesKey: 'history',
      });

      // Invoke with enhanced context
      const response = await withMessageHistory.invoke(
        {
          input: message,
          position: context.position || 'Software Developer',
          candidateName: context.candidateName || 'candidate',
          interviewType: context.interviewType || 'Technical Interview',
          currentQuestion: currentQuestion || "Let's start the interview",
          questionNumber: currentIndex + 1,
          totalQuestions: questions.length,
        },
        {
          configurable: {
            sessionId: sessionId,
          },
        }
      );

      return response;
    } catch (error) {
      console.error('LangChain interview agent error:', error);
      return "I'm sorry, I encountered an issue with the interview system. Could you please repeat your answer?";
    }
  }

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
    this.interviewQuestions.delete(sessionId);
    this.currentQuestionIndex.delete(sessionId);
  }

  getAllSessions() {
    return Array.from(this.sessions.keys());
  }
}

export default new LangChainInterviewAgent();
