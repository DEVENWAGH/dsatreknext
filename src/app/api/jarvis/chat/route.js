import { NextResponse } from 'next/server';

// Session storage for conversation history
const sessions = new Map();

export async function POST(request) {
  try {
    const { message, session_id, context } = await request.json();
    
    // Get or create session history
    if (!sessions.has(session_id)) {
      sessions.set(session_id, []);
    }
    const history = sessions.get(session_id);
    
    // Add user message to history
    history.push({ role: 'user', content: message });
    
    // Create system prompt
    const systemPrompt = `You are Jarvis, an AI interview conductor for ${context.position || 'Software Developer'} position.

Guidelines:
- Keep responses brief and professional (under 50 words)
- Ask follow-up questions naturally
- Be encouraging and supportive
- Address the candidate by name: ${context.candidateName || 'candidate'}
- Guide the conversation through interview questions
- Respond conversationally, not formally`;
    
    // Prepare messages for API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10) // Keep last 10 messages for context
    ];
    
    // Call OpenRouter API directly
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dsatrek.com',
        'X-Title': 'DSATrek Interview System'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 150
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm having trouble understanding. Could you try again?";
    
    // Add AI response to history
    history.push({ role: 'assistant', content: aiResponse });
    
    return NextResponse.json({ 
      success: true,
      response: aiResponse
    });
  } catch (error) {
    console.error('Error in Jarvis chat:', error);
    return NextResponse.json(
      { response: "I'm having trouble understanding. Could you try again?" },
      { status: 200 }
    );
  }
}