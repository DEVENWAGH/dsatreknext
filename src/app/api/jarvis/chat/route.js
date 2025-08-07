import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interviews } from '@/lib/schema/interview';
import { eq } from 'drizzle-orm';

// Session storage for conversation history
const sessions = new Map();

export async function POST(request) {
  try {
    const { message, sessionId, context, interviewData } = await request.json();

    // Get or create session history
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    const history = sessions.get(sessionId);

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Try to get interview questions from database if not provided in context
    let interviewQuestions = [];
    if (sessionId && (!context.questions || context.questions.length === 0)) {
      try {
        const dbInterview = await db
          .select({ questions: interviews.questions })
          .from(interviews)
          .where(eq(interviews.id, sessionId))
          .limit(1);

        if (dbInterview && dbInterview[0] && dbInterview[0].questions) {
          interviewQuestions = dbInterview[0].questions;
          console.log(
            '📋 Loaded questions from database:',
            interviewQuestions.length
          );
        }
      } catch (dbError) {
        console.warn(
          'Could not load questions from database:',
          dbError.message
        );
      }
    } else {
      interviewQuestions = context.questions || [];
    }

    // Process questions to extract text
    const questionsList = interviewQuestions
      .map(q => {
        if (typeof q === 'string') return q;
        return q.question || q.text || 'Question not available';
      })
      .join('\n- ');

    // Create comprehensive system prompt with interview context
    const systemPrompt = `You are Jarvis, an AI interview conductor for ${context.position || 'Software Developer'} position.

Interview Context:
- Position: ${context.position || 'Software Developer'}
- Candidate: ${context.candidateName || 'candidate'}
- Interview Type: ${context.interviewType || 'Technical Interview'}
- Difficulty: ${context.difficulty || 'medium'}
- Company: ${context.companyName || 'the company'}

Available Questions:
${questionsList ? `- ${questionsList}` : '- No specific questions loaded'}

Guidelines:
- Keep responses brief and professional (under 50 words)
- Ask follow-up questions naturally based on candidate answers
- Be encouraging and supportive  
- Address the candidate by name: ${context.candidateName || 'candidate'}
- Reference the specific position and interview context
- Use the available questions as a guide for the interview flow
- Respond conversationally, not formally
- If candidate seems to have finished answering, move to next relevant question`;

    // Prepare messages for API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // Keep last 10 messages for context
    ];

    // Call OpenRouter API directly
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer':
            process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'DSATrek Interview System',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: messages,
          temperature: 0.7,
          max_tokens: 150,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse =
      data.choices?.[0]?.message?.content ||
      "I'm having trouble understanding. Could you try again?";

    // Add AI response to history
    history.push({ role: 'assistant', content: aiResponse });

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error('Error in Jarvis chat:', error);
    return NextResponse.json(
      { response: "I'm having trouble understanding. Could you try again?" },
      { status: 200 }
    );
  }
}
