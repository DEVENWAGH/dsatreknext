import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

class LangChainInterviewAgent {
  constructor() {
    this.sessions = new Map();
    this.llm = null;
    this.chain = null;
  }

  initialize() {
    // Initialize LangChain ChatOpenAI with OpenRouter
    this.llm = new ChatOpenAI({
      temperature: 0.7,
      modelName: 'openai/gpt-4o',
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://dsatrek.com',
          'X-Title': 'DSATrek Interview System'
        }
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

Guidelines:
- Keep responses brief and professional (under 50 words)
- Ask follow-up questions naturally
- Be encouraging and supportive
- Guide the conversation through interview questions
- Respond conversationally, not formally
- Remember previous conversation context`,
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

  async chat(message, sessionId, context = {}) {
    if (!this.chain) {
      this.initialize();
    }

    try {
      // Create runnable with message history
      const withMessageHistory = new RunnableWithMessageHistory({
        runnable: this.chain,
        getMessageHistory: (sessionId) => this.getSessionHistory(sessionId),
        inputMessagesKey: 'input',
        historyMessagesKey: 'history',
      });

      // Invoke with context
      const response = await withMessageHistory.invoke(
        {
          input: message,
          position: context.position || 'Software Developer',
          candidateName: context.candidateName || 'candidate',
          interviewType: context.interviewType || 'Technical Interview',
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
      return "I'm sorry, could you please repeat that?";
    }
  }

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  getAllSessions() {
    return Array.from(this.sessions.keys());
  }
}

export default new LangChainInterviewAgent();