import { NextResponse } from 'next/server';
import { interviewFeedbackService } from '@/services/interviewFeedbackService';

export async function POST(request) {
  try {
    const {
      transcript,
      interviewData,
      stats,
      service = 'voice',
      generateReport = false,
    } = await request.json();

    // Validate required data
    if (!transcript || !interviewData) {
      return NextResponse.json(
        {
          error:
            'Missing required data: transcript and interviewData are required',
        },
        { status: 400 }
      );
    }

    // Generate feedback
    const feedbackResult = await interviewFeedbackService.generateFeedback({
      transcript,
      interviewData,
      stats: stats || {},
      service,
    });

    if (!feedbackResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to generate feedback',
          details: feedbackResult.error,
          fallbackFeedback: feedbackResult.fallbackFeedback,
        },
        { status: 500 }
      );
    }

    let detailedReport = null;
    if (generateReport) {
      try {
        detailedReport = await interviewFeedbackService.generateDetailedReport(
          feedbackResult.feedback,
          interviewData
        );
      } catch (reportError) {
        console.error('Failed to generate detailed report:', reportError);
        // Continue without failing the main request
      }
    }

    // Save feedback to database (if you have a database setup)
    // await saveInterviewFeedback({
    //   interviewId: interviewData.id,
    //   feedback: feedbackResult.feedback,
    //   transcript,
    //   stats,
    //   service
    // });

    return NextResponse.json({
      success: true,
      feedback: feedbackResult.feedback,
      report: detailedReport,
      generatedAt: feedbackResult.generatedAt,
      service: feedbackResult.service,
      metadata: {
        transcriptLength: transcript.length,
        statsProvided: !!stats,
        reportGenerated: !!detailedReport,
      },
    });
  } catch (error) {
    console.error('Interview feedback API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return NextResponse.json({
          status: 'ready',
          geminiConfigured: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
          features: {
            feedbackGeneration: true,
            detailedReports: true,
            voiceSpecificAnalysis: true,
            multiLanguageSupport: true,
          },
        });

      case 'sample':
        // Return a sample feedback structure
        return NextResponse.json({
          sampleFeedback: {
            overallScore: 7,
            overallFeedback: 'Good performance with room for improvement',
            strengths: ['Clear communication', 'Technical knowledge'],
            areasForImprovement: ['Response timing', 'Confidence'],
            technicalSkills: {
              score: 7,
              feedback: 'Solid technical foundation',
              keyPoints: ['Good problem-solving approach'],
            },
            communicationSkills: {
              score: 8,
              feedback: 'Clear and articulate communication',
              keyPoints: ['Spoke clearly', 'Good voice quality'],
            },
            voiceInterviewSpecific: {
              speechClarity: 8,
              responseTime: 'Good response timing',
              confidenceLevel: 6,
              voiceQuality: 'Clear and professional',
            },
            recommendations: ['Practice more technical examples'],
            estimatedLevel: 'Intermediate',
            hiringRecommendation: 'Hire',
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use ?action=status or ?action=sample' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Interview feedback GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
