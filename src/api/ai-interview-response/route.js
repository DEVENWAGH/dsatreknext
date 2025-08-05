import { NextResponse } from 'next/server';

const SYSTEM_PROMPTS = {
  hinglish: `Aap ek AI interviewer hain. Candidate ke saath Hinglish mein baat kariye - Hindi words English script mein likhiye. Professional rahiye lekin friendly bhi. Unke answers par follow-up questions puchiye.`,
  english: `You are an AI interviewer. Conduct a professional yet friendly interview. Ask follow-up questions based on the candidate's responses.`,
};

export async function POST(request) {
  try {
    const { userInput, language = 'english', context } = await request.json();

    const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.english;

    const messages = [
      {
        role: 'system',
        content: `${systemPrompt}
        
Context:
- Position: ${context.position}
- Interview Type: ${context.interviewType}
- Candidate Name: ${context.candidateName}
- Preferred Language: ${context.preferredLanguage}

Instructions:
- Respond in ${language === 'hinglish' ? 'Hinglish (Hindi words in English script)' : 'English'}
- Keep responses conversational and under 100 words
- Ask relevant follow-up questions
- Be encouraging and professional`,
      },
      {
        role: 'user',
        content: userInput,
      },
    ];

    // Use a simple response generation or integrate with your preferred AI service
    const response = await generateAIResponse(messages, language);

    return NextResponse.json({
      response,
      language,
      success: true,
    });
  } catch (error) {
    console.error('AI Interview Response Error:', error);

    const fallbackResponses = {
      hinglish: 'Dhanyawad. Kya aap is baare mein aur bata sakte hain?',
      english: 'Thank you. Can you tell me more about this?',
    };

    return NextResponse.json({
      response: fallbackResponses[language] || fallbackResponses.english,
      language,
      success: false,
      error: 'Fallback response used',
    });
  }
}

async function generateAIResponse(messages, language) {
  try {
    // Enhanced AI response generation for Deepgram Voice Agent integration

    // Get the last user message to analyze context
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Contextual response generation based on content
    const responses = {
      hinglish: {
        technical: [
          'Bahut accha technical answer! Kya aap is approach ke pros aur cons bata sakte hain?',
          'Samajh gaya. Kya aap code complexity ke baare mein baat kar sakte hain?',
          'Accha! Is solution ka time aur space complexity kya hoga?',
          'Interesting approach! Kya koi alternative solution bhi soch sakte hain?',
        ],
        behavioral: [
          'Bahut accha example! Is situation mein aapne team ke saath kaise collaborate kiya?',
          'Samajh gaya. Kya aap conflict resolution ke baare mein bata sakte hain?',
          'Accha! Is experience se aapne leadership ke baare mein kya seekha?',
          'Interesting! Kya aap similar situation mein different approach apnayenge?',
        ],
        general: [
          'Bahut accha answer! Kya aap is baare mein aur detail mein bata sakte hain?',
          'Samajh gaya. Kya koi specific example de sakte hain?',
          'Accha! Isme aapki sabse badi learning kya thi?',
          'Interesting! Kya aap is experience ko apne career mein kaise apply karenge?',
        ],
      },
      english: {
        technical: [
          'Great technical answer! Can you explain the pros and cons of this approach?',
          'I see. Can you discuss the code complexity involved?',
          'Good! What would be the time and space complexity of this solution?',
          'Interesting approach! Can you think of any alternative solutions?',
        ],
        behavioral: [
          'Great example! How did you collaborate with your team in this situation?',
          'I understand. Can you tell me about conflict resolution?',
          'Good! What did you learn about leadership from this experience?',
          'Interesting! Would you approach a similar situation differently?',
        ],
        general: [
          'Great answer! Can you tell me more details about this?',
          'I see. Can you give me a specific example?',
          'Good! What was your biggest learning from this?',
          'Interesting! How will you apply this experience in your career?',
        ],
      },
    };

    // Determine response category based on keywords
    let category = 'general';
    const technicalKeywords = [
      'algorithm',
      'code',
      'programming',
      'data structure',
      'complexity',
      'technical',
      'implementation',
    ];
    const behavioralKeywords = [
      'team',
      'leadership',
      'conflict',
      'collaboration',
      'management',
      'communication',
      'challenge',
    ];

    if (
      technicalKeywords.some(keyword =>
        lastUserMessage.toLowerCase().includes(keyword)
      )
    ) {
      category = 'technical';
    } else if (
      behavioralKeywords.some(keyword =>
        lastUserMessage.toLowerCase().includes(keyword)
      )
    ) {
      category = 'behavioral';
    }

    const langResponses = responses[language] || responses.english;
    const categoryResponses = langResponses[category] || langResponses.general;

    return categoryResponses[
      Math.floor(Math.random() * categoryResponses.length)
    ];
  } catch (error) {
    console.error('Error generating AI response:', error);

    // Fallback responses
    const fallbacks = {
      hinglish: 'Dhanyawad. Kya aap is baare mein aur bata sakte hain?',
      english: 'Thank you. Can you tell me more about this?',
    };

    return fallbacks[language] || fallbacks.english;
  }
}
