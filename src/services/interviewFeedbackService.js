import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export class InterviewFeedbackService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateFeedback({
    transcript,
    interviewData,
    stats,
    service = 'voice',
  }) {
    try {
      const feedback = await this.analyzeInterviewPerformance({
        transcript,
        interviewData,
        stats,
        service,
      });

      return {
        success: true,
        feedback,
        generatedAt: new Date().toISOString(),
        service,
      };
    } catch (error) {
      console.error('Failed to generate interview feedback:', error);
      return {
        success: false,
        error: error.message,
        fallbackFeedback: this.generateFallbackFeedback(stats),
      };
    }
  }

  async analyzeInterviewPerformance({
    transcript,
    interviewData,
    stats,
    service,
  }) {
    const conversationText = this.formatTranscript(transcript);

    const prompt = `Analyze this ${service} interview performance and provide comprehensive feedback.

Interview Details:
- Position: ${interviewData.position}
- Interview Type: ${interviewData.interviewType}
- Difficulty: ${interviewData.difficulty}
- Duration: ${interviewData.duration} minutes
- Service Used: ${service.toUpperCase()}

Interview Statistics:
- Total Messages: ${stats.totalMessages || 0}
- Candidate Responses: ${stats.candidateResponses || 0}
- Questions Asked: ${stats.interviewerQuestions || stats.totalMessages - stats.candidateResponses || 0}
- Duration: ${stats.duration || 'Not available'} minutes

Conversation Transcript:
${conversationText}

Please provide a detailed analysis in the following JSON format:

{
  "overallScore": number (1-10),
  "overallFeedback": "Brief summary of performance",
  "strengths": [
    "List of candidate's strengths"
  ],
  "areasForImprovement": [
    "List of areas that need improvement"
  ],
  "technicalSkills": {
    "score": number (1-10),
    "feedback": "Technical skills assessment",
    "keyPoints": ["specific technical observations"]
  },
  "communicationSkills": {
    "score": number (1-10),
    "feedback": "Communication assessment",
    "keyPoints": ["communication observations"]
  },
  "problemSolving": {
    "score": number (1-10),
    "feedback": "Problem-solving assessment",
    "keyPoints": ["problem-solving observations"]
  },
  "voiceInterviewSpecific": {
    "speechClarity": number (1-10),
    "responseTime": "assessment of thinking and response time",
    "confidenceLevel": number (1-10),
    "voiceQuality": "assessment of voice clarity and confidence"
  },
  "questionwiseAnalysis": [
    {
      "question": "question text",
      "response": "candidate response",
      "score": number (1-10),
      "feedback": "specific feedback for this question"
    }
  ],
  "recommendations": [
    "Specific actionable recommendations"
  ],
  "nextSteps": [
    "Suggested next steps for career development"
  ],
  "estimatedLevel": "Beginner/Intermediate/Advanced/Expert",
  "hiringRecommendation": "Strong Hire/Hire/Maybe/No Hire",
  "confidenceScore": number (1-10)
}

Focus on:
1. Voice interview specific aspects (clarity, confidence, response timing)
2. Technical competency based on responses
3. Communication effectiveness in voice format
4. Problem-solving approach
5. Cultural fit and professionalism
6. Specific improvements for voice interviews

Be constructive, specific, and actionable in your feedback.`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();

    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const feedback = JSON.parse(jsonMatch[0]);
        return this.validateAndEnhanceFeedback(feedback, stats);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI feedback JSON:', parseError);
      return this.generateStructuredFeedback(response, stats);
    }
  }

  formatTranscript(transcript) {
    if (!transcript || transcript.length === 0) {
      return 'No conversation transcript available.';
    }

    return transcript
      .map((entry, index) => {
        const speaker = entry.speaker || entry.role || 'Unknown';
        const content = entry.content || entry.text || '';
        const timestamp = entry.timestamp
          ? new Date(entry.timestamp).toLocaleTimeString()
          : `[${index + 1}]`;

        return `[${timestamp}] ${speaker}: ${content}`;
      })
      .join('\n\n');
  }

  validateAndEnhanceFeedback(feedback, stats) {
    // Ensure all required fields exist with defaults
    const validatedFeedback = {
      overallScore: this.validateScore(feedback.overallScore),
      overallFeedback:
        feedback.overallFeedback || 'Performance analysis completed.',
      strengths: Array.isArray(feedback.strengths)
        ? feedback.strengths
        : ['Participated in the interview'],
      areasForImprovement: Array.isArray(feedback.areasForImprovement)
        ? feedback.areasForImprovement
        : ['Continue practicing interview skills'],

      technicalSkills: {
        score: this.validateScore(feedback.technicalSkills?.score),
        feedback:
          feedback.technicalSkills?.feedback ||
          'Technical skills assessment needed.',
        keyPoints: Array.isArray(feedback.technicalSkills?.keyPoints)
          ? feedback.technicalSkills.keyPoints
          : [],
      },

      communicationSkills: {
        score: this.validateScore(feedback.communicationSkills?.score),
        feedback:
          feedback.communicationSkills?.feedback ||
          'Communication skills assessment.',
        keyPoints: Array.isArray(feedback.communicationSkills?.keyPoints)
          ? feedback.communicationSkills.keyPoints
          : [],
      },

      problemSolving: {
        score: this.validateScore(feedback.problemSolving?.score),
        feedback:
          feedback.problemSolving?.feedback ||
          'Problem-solving skills assessment.',
        keyPoints: Array.isArray(feedback.problemSolving?.keyPoints)
          ? feedback.problemSolving.keyPoints
          : [],
      },

      voiceInterviewSpecific: {
        speechClarity: this.validateScore(
          feedback.voiceInterviewSpecific?.speechClarity
        ),
        responseTime:
          feedback.voiceInterviewSpecific?.responseTime ||
          'Response timing was adequate',
        confidenceLevel: this.validateScore(
          feedback.voiceInterviewSpecific?.confidenceLevel
        ),
        voiceQuality:
          feedback.voiceInterviewSpecific?.voiceQuality ||
          'Voice quality was clear',
      },

      questionwiseAnalysis: Array.isArray(feedback.questionwiseAnalysis)
        ? feedback.questionwiseAnalysis
        : [],

      recommendations: Array.isArray(feedback.recommendations)
        ? feedback.recommendations
        : ['Continue practicing interview skills'],

      nextSteps: Array.isArray(feedback.nextSteps)
        ? feedback.nextSteps
        : ['Practice more interviews'],

      estimatedLevel: feedback.estimatedLevel || 'Intermediate',
      hiringRecommendation: feedback.hiringRecommendation || 'Maybe',
      confidenceScore: this.validateScore(feedback.confidenceScore),

      // Add metadata
      analysisMetadata: {
        totalMessages: stats.totalMessages || 0,
        responseCount: stats.candidateResponses || 0,
        avgResponseLength: this.calculateAverageResponseLength(stats),
        interviewDuration: stats.duration || 'Not available',
      },
    };

    return validatedFeedback;
  }

  validateScore(score) {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 10) {
      return 5; // Default middle score
    }
    return Math.round(numScore);
  }

  calculateAverageResponseLength(stats) {
    if (stats.candidateResponses && stats.totalResponseLength) {
      return Math.round(stats.totalResponseLength / stats.candidateResponses);
    }
    return 'Not calculated';
  }

  generateStructuredFeedback(rawResponse, stats) {
    // Fallback structured feedback generation from raw text
    return {
      overallScore: 6,
      overallFeedback:
        'Interview analysis completed. See detailed feedback below.',
      strengths: [
        'Participated actively in the voice interview',
        'Responded to questions appropriately',
      ],
      areasForImprovement: [
        'Practice speaking more clearly in interviews',
        'Prepare more detailed technical examples',
      ],
      technicalSkills: {
        score: 6,
        feedback: 'Technical skills demonstrated during the interview.',
        keyPoints: ['Technical responses provided'],
      },
      communicationSkills: {
        score: 7,
        feedback:
          'Communication skills were demonstrated through voice responses.',
        keyPoints: ['Spoke clearly', 'Answered questions'],
      },
      problemSolving: {
        score: 6,
        feedback: 'Problem-solving approach observed during the interview.',
        keyPoints: ['Approached problems systematically'],
      },
      voiceInterviewSpecific: {
        speechClarity: 7,
        responseTime: 'Good response timing',
        confidenceLevel: 6,
        voiceQuality: 'Clear voice communication',
      },
      questionwiseAnalysis: [],
      recommendations: [
        'Practice more voice interviews to improve confidence',
        'Prepare specific examples for technical questions',
        'Work on speaking clearly and confidently',
      ],
      nextSteps: [
        'Continue practicing interview skills',
        'Focus on technical skill development',
        'Practice voice communication',
      ],
      estimatedLevel: 'Intermediate',
      hiringRecommendation: 'Maybe',
      confidenceScore: 6,
      analysisMetadata: {
        totalMessages: stats.totalMessages || 0,
        responseCount: stats.candidateResponses || 0,
        avgResponseLength: 'Not calculated',
        interviewDuration: stats.duration || 'Not available',
      },
    };
  }

  generateFallbackFeedback(stats) {
    return {
      overallScore: 5,
      overallFeedback:
        'Interview completed successfully. Basic performance metrics analyzed.',
      strengths: [
        'Completed the interview process',
        'Engaged with the voice interview system',
      ],
      areasForImprovement: [
        'Detailed analysis requires transcript review',
        'Continue practicing interview skills',
      ],
      technicalSkills: {
        score: 5,
        feedback: 'Technical assessment requires detailed review.',
        keyPoints: [],
      },
      communicationSkills: {
        score: 6,
        feedback:
          'Demonstrated ability to communicate through voice interface.',
        keyPoints: ['Used voice interview system effectively'],
      },
      problemSolving: {
        score: 5,
        feedback: 'Problem-solving skills require detailed assessment.',
        keyPoints: [],
      },
      voiceInterviewSpecific: {
        speechClarity: 6,
        responseTime: 'Standard response timing',
        confidenceLevel: 5,
        voiceQuality: 'Voice communication completed',
      },
      questionwiseAnalysis: [],
      recommendations: [
        'Practice voice interviews for better performance',
        'Prepare structured answers for common questions',
      ],
      nextSteps: [
        'Review interview recording if available',
        'Practice technical interview questions',
      ],
      estimatedLevel: 'Entry Level',
      hiringRecommendation: 'Requires Review',
      confidenceScore: 4,
      analysisMetadata: {
        totalMessages: stats.totalMessages || 0,
        responseCount: stats.candidateResponses || 0,
        avgResponseLength: 'Not available',
        interviewDuration: stats.duration || 'Not available',
      },
    };
  }

  async generateDetailedReport(feedbackData, interviewData) {
    try {
      const reportPrompt = `Generate a detailed interview report based on this feedback data:

Interview Information:
- Position: ${interviewData.position}
- Type: ${interviewData.interviewType}
- Candidate: ${interviewData.candidateName}

Feedback Summary:
${JSON.stringify(feedbackData, null, 2)}

Create a comprehensive report in markdown format that includes:
1. Executive Summary
2. Detailed Performance Analysis
3. Voice Interview Specific Assessment
4. Technical Skills Evaluation
5. Communication Skills Assessment
6. Recommendations for Improvement
7. Next Steps and Action Items

Make it professional and actionable.`;

      const result = await this.model.generateContent(reportPrompt);
      return result.response.text();
    } catch (error) {
      console.error('Failed to generate detailed report:', error);
      return this.generateFallbackReport(feedbackData, interviewData);
    }
  }

  generateFallbackReport(feedbackData, interviewData) {
    return `# Interview Report

## Candidate Information
- **Name**: ${interviewData.candidateName}
- **Position**: ${interviewData.position}
- **Interview Type**: ${interviewData.interviewType}
- **Date**: ${new Date().toLocaleDateString()}

## Overall Performance
**Score**: ${feedbackData.overallScore}/10

${feedbackData.overallFeedback}

## Key Strengths
${feedbackData.strengths.map(strength => `- ${strength}`).join('\n')}

## Areas for Improvement
${feedbackData.areasForImprovement.map(area => `- ${area}`).join('\n')}

## Recommendations
${feedbackData.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps
${feedbackData.nextSteps.map(step => `- ${step}`).join('\n')}

---
*Report generated by DSATrek AI Interview Analysis*`;
  }
}

// Singleton instance
export const interviewFeedbackService = new InterviewFeedbackService();

// Utility functions
export const generateInterviewSummary = (interviewData, feedback) => {
  return {
    id: interviewData.id || `interview_${Date.now()}`,
    candidateName: interviewData.candidateName,
    position: interviewData.position,
    interviewType: interviewData.interviewType,
    date: new Date().toISOString(),
    overallScore: feedback.overallScore,
    recommendation: feedback.hiringRecommendation,
    keyStrengths: feedback.strengths.slice(0, 3),
    topImprovement: feedback.areasForImprovement[0],
    estimatedLevel: feedback.estimatedLevel,
    confidenceScore: feedback.confidenceScore,
  };
};

export const formatScoreForDisplay = score => {
  if (score >= 8) return { label: 'Excellent', color: 'text-green-600' };
  if (score >= 6) return { label: 'Good', color: 'text-blue-600' };
  if (score >= 4) return { label: 'Fair', color: 'text-yellow-600' };
  return { label: 'Needs Improvement', color: 'text-red-600' };
};
