import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const {
      position,
      duration,
      completionRate,
      interviewType,
      difficulty,
      questionsCount,
      transcript,
    } = await request.json();

    // Log the received transcript for debugging
    console.log('📝 Received transcript data:', {
      length: transcript?.length || 0,
      sample:
        transcript?.slice(0, 2) ||
        'No transcript available for feedback generation',
    });

    if (!transcript || transcript.length === 0) {
      console.warn(
        'No transcript provided - generating basic feedback without conversation analysis'
      );
    }

    // Format transcript for AI analysis with better handling
    const conversationText =
      transcript?.length > 0
        ? transcript
            .filter(msg => msg && (msg.text || msg.content)) // Filter out empty messages
            .map(msg => {
              const role =
                msg.role === 'assistant' ? 'Interviewer' : 'Candidate';
              const content = msg.text || msg.content || '';
              return `${role}: ${content}`;
            })
            .join('\n\n')
        : 'No conversation transcript available for analysis.';

    // Create the prompt with transcript length monitoring
    let conversationForPrompt = conversationText;

    // Check if conversation is excessively long (approximate token limit for safety)
    // Gemini context window is ~30K tokens, but we'll limit to ~20K chars for safety
    if (conversationText.length > 20000) {
      console.warn(
        'Transcript too long, truncating to approximately 20K characters'
      );
      conversationForPrompt =
        conversationText.substring(0, 20000) +
        '\n\n[Conversation truncated due to length...]';
    }

    const prompt = `Analyze this interview conversation and provide professional feedback for the candidate.

Interview Details:
- Position: ${position}
- Duration: ${duration}
- Completion Rate: ${completionRate}%
- Interview Type: ${interviewType}
- Difficulty Level: ${difficulty}
- Questions Prepared: ${questionsCount}

Interview Conversation:
${conversationForPrompt}

Based on the actual conversation, provide constructive feedback covering:
1. Overall performance assessment
2. Communication skills and clarity
3. Technical competency and knowledge
4. Problem-solving approach
5. Areas of strength demonstrated
6. Areas for improvement
7. Final recommendation

Keep the feedback professional, specific to their responses, constructive, and encouraging. Format the response as structured text with clear sections.`;

    // Try to use Gemini API first
    try {
      const geminiApiKey =
        process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('Gemini API key not found in environment variables');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini response:', data);

      // Extract feedback from Gemini's response structure
      let feedback;

      if (
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content
      ) {
        feedback = data.candidates[0].content.parts[0].text;
      } else if (data.text) {
        feedback = data.text;
      } else {
        console.warn('Unexpected Gemini API response format:', data);
        throw new Error('Unable to parse Gemini API response');
      }
      return NextResponse.json({ feedback });
    } catch (apiError) {
      console.error('Gemini API error (first attempt):', apiError.message);
      console.log('Attempting alternative Gemini API approach...');

      // Try using AI_CONFIG constant if available
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(
          process.env.NEXT_PUBLIC_GEMINI_API_KEY
        );
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        const response = result.response?.text();

        if (response) {
          return NextResponse.json({ feedback: response });
        }
      } catch (secondError) {
        console.error(
          'Second attempt with Gemini SDK failed:',
          secondError.message
        );
        console.log(
          'Both Gemini API attempts failed. Using fallback feedback generation.'
        );
      }

      // Log what we received in the transcript
      console.log('Transcript entries received:', transcript?.length || 0);

      // Generate fallback feedback with basic information available
      let transcriptSummary = '';
      if (transcript && transcript.length > 0) {
        const candidateResponses = transcript.filter(
          msg => msg.role !== 'assistant'
        ).length;
        transcriptSummary = `\nCandidate provided ${candidateResponses} responses during the interview.`;
      }

      // Fallback to a basic feedback if API fails
      const fallbackFeedback = `
# Interview Feedback Summary

**Position:** ${position || 'N/A'}
**Duration:** ${duration || 'N/A'}
**Completion Rate:** ${completionRate || 'N/A'}%
**Interview Type:** ${interviewType || 'N/A'}
**Difficulty Level:** ${difficulty || 'N/A'}${transcriptSummary}

## Overall Assessment
Thank you for participating in the interview. You've shown commitment by completing the interview process.

## Communication
Based on the transcript, you demonstrated a willingness to engage with the interview questions.

## Technical Knowledge
You participated in a ${difficulty || 'standard'} level technical interview for the ${position || 'role'}.

## Areas for Improvement
Consider providing more detailed responses to technical questions to showcase your expertise.

## Recommendation
Continue practicing interview scenarios and deepening your knowledge in key technical areas relevant to the ${position || 'role'}.
`;

      return NextResponse.json({ feedback: fallbackFeedback });
    }
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
