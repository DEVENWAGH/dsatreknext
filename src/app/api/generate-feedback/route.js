import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { position, duration, completionRate, interviewType, difficulty, questionsCount, transcript } = await request.json();

    // Format transcript for AI analysis
    const conversationText = transcript?.length > 0 
      ? transcript.map(msg => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.text}`).join('\n')
      : 'No conversation transcript available.';

    const prompt = `Analyze this interview conversation and provide professional feedback for the candidate.

Interview Details:
- Position: ${position}
- Duration: ${duration}
- Completion Rate: ${completionRate}%
- Interview Type: ${interviewType}
- Difficulty Level: ${difficulty}
- Questions Prepared: ${questionsCount}

Interview Conversation:
${conversationText}

Based on the actual conversation, provide constructive feedback covering:
1. Overall performance assessment
2. Communication skills and clarity
3. Technical competency and knowledge
4. Problem-solving approach
5. Areas of strength demonstrated
6. Areas for improvement
7. Final recommendation

Keep the feedback professional, specific to their responses, constructive, and encouraging.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response:', data);
    
    const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate feedback at this time.';
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}