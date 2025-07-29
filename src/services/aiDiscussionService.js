import OpenAI from 'openai';
import { DEFAULT_DISCUSSION_MODEL } from '@/utils/aiModels';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export const generateAIDiscussionResponse = async ({
  message,
  problem,
  model = DEFAULT_DISCUSSION_MODEL,
  conversationHistory = [],
  userCode = '',
  solution = '',
}) => {
  try {
    const systemPrompt = `You are an expert programming tutor helping students understand data structures and algorithms problems. 

Problem Context:
- Title: ${problem.title}
- Difficulty: ${problem.difficulty}
- Description: ${typeof problem.description === 'string' ? problem.description.substring(0, 400) : JSON.stringify(problem.description || '').substring(0, 400)}...
${problem.constraints ? `- Constraints: ${typeof problem.constraints === 'string' ? problem.constraints.substring(0, 200) : JSON.stringify(problem.constraints).substring(0, 200)}...` : ''}
${problem.examples ? `- Examples: ${JSON.stringify(problem.examples).substring(0, 200)}...` : ''}

${
  userCode
    ? `Current User Code:
\`\`\`
${typeof userCode === 'string' ? userCode.substring(0, 500) : JSON.stringify(userCode).substring(0, 500)}
\`\`\`
`
    : ''
}
${
  solution
    ? `Reference Solution:
\`\`\`
${typeof solution === 'string' ? solution.substring(0, 400) : JSON.stringify(solution).substring(0, 400)}
\`\`\`
`
    : ''
}
Guidelines:
- Provide clear, educational explanations
- Help with problem-solving approaches and algorithms
- Explain time/space complexity when relevant
- Give hints rather than complete solutions unless specifically asked
- Be encouraging and supportive
- Use code examples when helpful
- Focus on learning and understanding
- Reference the user's current code when giving feedback

Keep responses concise but informative.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    return {
      success: true,
      response: completion.choices[0].message.content.trim(),
      model: model,
    };
  } catch (error) {
    console.error('AI Discussion Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate AI response',
    };
  }
};
