import OpenAI from 'openai';
import { INTERVIEW_MODELS, DEFAULT_INTERVIEW_MODEL } from '@/utils/aiModels';
import { generateInterviewQuestionsWithGemini } from './geminiService';
import { getRefererUrl } from '@/utils/environmentUtils';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export const generateInterviewQuestions = async (
  jobData,
  selectedModel = DEFAULT_INTERVIEW_MODEL
) => {
  // Use Gemini directly if selected
  if (selectedModel === 'gemini-2.5-flash') {
    try {
      return await generateInterviewQuestionsWithGemini(jobData);
    } catch (error) {
      console.error(
        'Gemini direct API failed, falling back to OpenRouter:',
        error
      );
      console.log('Using fallback model: openai/gpt-4-turbo');
    }
  }

  // If Gemini failed, start with fallback model, otherwise use selected model
  const startingModel =
    selectedModel === 'gemini-2.5-flash' ? 'openai/gpt-4-turbo' : selectedModel;

  const availableModels = [
    startingModel,
    'openai/gpt-4-turbo',
    ...INTERVIEW_MODELS.map(m => m.id),
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .filter(model => model !== 'gemini-2.5-flash'); // Exclude direct Gemini from OpenRouter

  for (const model of availableModels) {
    try {
      const getQuestionCount = (type, difficulty, duration) => {
        const durationNum = parseInt(duration) || 30;
        let baseCount =
          {
            'Problem Solving': 2,
            'System Design': 1,
            Behavioral: 5,
            Technical: 3,
            General: 4,
          }[type] || 3;

        if (durationNum <= 30) {
          baseCount = Math.max(1, Math.floor(baseCount * 0.7));
        } else if (durationNum >= 90) {
          baseCount = Math.ceil(baseCount * 1.5);
        }

        if (difficulty === 'hard') {
          baseCount = Math.max(1, baseCount - 1);
        } else if (difficulty === 'easy') {
          baseCount = baseCount + 1;
        }

        return Math.min(baseCount, 7);
      };

      const questionCount = getQuestionCount(
        jobData.interviewType,
        jobData.difficulty,
        jobData.duration
      );

      const prompt = `Generate exactly ${questionCount} interview questions for a ${jobData.position} position.

Job Description: ${jobData.jobDescription}
Interview Type: ${jobData.interviewType}
Difficulty: ${jobData.difficulty}
Duration: ${jobData.duration}
IMPORTANT: Generate EXACTLY ${questionCount} questions. No more, no less.

Question Distribution Guidelines:
- Problem Solving/DSA: 2 questions max (each takes 15-20 minutes)
- System Design: 1-2 questions (takes 30-45 minutes each)
- Behavioral: 5-7 questions (5-10 minutes each)
- Technical: 3-5 questions (mix of quick and detailed)
- General: 4-6 questions (balanced mix)

Format each question EXACTLY as shown:

QUESTION 1:
Question: [Your specific question here]
Type: [behavioral/technical/situational/problem-solving/system-design]
Category: [e.g., JavaScript, Problem Solving, Leadership, DSA, System Architecture]
Difficulty: ${jobData.difficulty}
Expected Answer: [Brief description of what makes a good answer]

QUESTION 2:
Question: [Your specific question here]
Type: [behavioral/technical/situational/problem-solving/system-design]
Category: [e.g., JavaScript, Problem Solving, Leadership, DSA, System Architecture]
Difficulty: ${jobData.difficulty}
Expected Answer: [Brief description of what makes a good answer]

[Continue this exact format for all ${questionCount} questions]

Make questions highly relevant to the job description, appropriate for ${jobData.difficulty} difficulty, and suitable for ${jobData.duration} interview duration.`;

      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0].message.content.trim();
      const parsedQuestions = parseAIResponse(response, jobData.difficulty);

      return parsedQuestions;
    } catch {
      if (model === availableModels[availableModels.length - 1]) {
        throw new Error(
          'Failed to generate interview questions from AI service. No fallback questions available.'
        );
      }
      continue;
    }
  }
};

const parseAIResponse = (response, difficulty) => {
  const questions = [];

  try {
    const questionBlocks = response.split(/QUESTION \d+:/i);

    questionBlocks.forEach((block, index) => {
      if (index === 0 || !block.trim()) return;

      const lines = block
        .trim()
        .split('\n')
        .filter(line => line.trim());
      const questionData = {};

      lines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine.match(/^Question:/i)) {
          questionData.question = trimmedLine
            .replace(/^Question:\s*/i, '')
            .trim();
        } else if (trimmedLine.match(/^Type:/i)) {
          questionData.type = trimmedLine.replace(/^Type:\s*/i, '').trim();
        } else if (trimmedLine.match(/^Category:/i)) {
          questionData.category = trimmedLine
            .replace(/^Category:\s*/i, '')
            .trim();
        } else if (trimmedLine.match(/^Expected Answer:/i)) {
          questionData.expectedAnswer = trimmedLine
            .replace(/^Expected Answer:\s*/i, '')
            .trim();
        }
      });

      if (questionData.question && questionData.question.length > 10) {
        questions.push({
          question: questionData.question,
          type: questionData.type || 'technical',
          category: questionData.category || 'General',
          difficulty: difficulty,
          expectedAnswer:
            questionData.expectedAnswer ||
            'Provide a detailed response with examples.',
        });
      }
    });

    if (questions.length < 1) {
      throw new Error('No valid questions could be parsed from AI response');
    }

    return questions;
  } catch {
    throw new Error('Failed to parse AI response into valid questions');
  }
};
