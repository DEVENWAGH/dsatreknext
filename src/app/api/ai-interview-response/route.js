import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userInput, context, currentQuestion, questionIndex } = await request.json();

    const prompt = `You are an AI interviewer conducting a professional interview.

Context:
- Position: ${context.position}
- Interview Type: ${context.interviewType}
- Current Question: ${currentQuestion}
- Question ${questionIndex + 1} of ${context.totalQuestions}

User's Response: "${userInput}"

Based on their response, provide a brief, professional follow-up. If their answer is complete, move to the next question naturally. If you need clarification, ask a follow-up question. Keep responses under 50 words and conversational.

Guidelines:
- Be encouraging and professional
- Ask follow-up questions if needed
- Transition smoothly between questions
- Address the candidate by name: ${context.candidateName}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { response: "Thank you for your response. Let's continue with the next question." },
      { status: 200 }
    );
  }
}