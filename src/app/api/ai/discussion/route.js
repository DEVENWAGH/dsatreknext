import { NextResponse } from 'next/server';

import { generateAIDiscussionResponse } from '@/services/aiDiscussionService';

export async function POST(request) {
  try {
    const { message, problem, model, conversationHistory, userCode, solution } =
      await request.json();

    if (!message || !problem) {
      return NextResponse.json(
        { error: 'Message and problem are required' },
        { status: 400 }
      );
    }

    const result = await generateAIDiscussionResponse({
      message,
      problem,
      model,
      conversationHistory,
      userCode,
      solution,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        response: result.response,
        model: result.model,
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('AI Discussion API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
