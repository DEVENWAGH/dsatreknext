import { NextResponse } from 'next/server';
import DeepgramVoiceAgent from '@/services/deepgramVoiceAgent';

export async function POST(request) {
  try {
    const { action, interviewConfig, audioData } = await request.json();

    if (!process.env.DEEPGRAM_API_KEY) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'startInterview':
        return await handleStartInterview(interviewConfig);

      case 'processAudio':
        return await handleProcessAudio(audioData);

      case 'endInterview':
        return await handleEndInterview();

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Deepgram Voice Agent API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function handleStartInterview(interviewConfig) {
  try {
    // Validate interview config
    if (
      !interviewConfig ||
      !interviewConfig.position ||
      !interviewConfig.interviewType
    ) {
      return NextResponse.json(
        { error: 'Invalid interview configuration' },
        { status: 400 }
      );
    }

    // Create voice agent instance
    const voiceAgent = new DeepgramVoiceAgent(process.env.DEEPGRAM_API_KEY);

    // Start interview session
    await voiceAgent.startVoiceInterview(interviewConfig);

    return NextResponse.json({
      success: true,
      message: 'Interview session started successfully',
      config: {
        position: interviewConfig.position,
        interviewType: interviewConfig.interviewType,
        language: interviewConfig.language || 'english',
      },
    });
  } catch (error) {
    console.error('Failed to start interview:', error);
    return NextResponse.json(
      { error: 'Failed to start interview session', details: error.message },
      { status: 500 }
    );
  }
}

async function handleProcessAudio(audioData) {
  try {
    if (!audioData) {
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    // Process audio data with Deepgram
    // This would typically involve real-time processing
    // For now, we'll return a success response

    return NextResponse.json({
      success: true,
      message: 'Audio processed successfully',
    });
  } catch (error) {
    console.error('Failed to process audio:', error);
    return NextResponse.json(
      { error: 'Failed to process audio', details: error.message },
      { status: 500 }
    );
  }
}

async function handleEndInterview() {
  try {
    // Handle interview cleanup and return final data
    return NextResponse.json({
      success: true,
      message: 'Interview ended successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to end interview:', error);
    return NextResponse.json(
      { error: 'Failed to end interview', details: error.message },
      { status: 500 }
    );
  }
}

// Handle GET requests for interview status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return NextResponse.json({
          status: 'ready',
          deepgramConfigured: !!process.env.DEEPGRAM_API_KEY,
          timestamp: new Date().toISOString(),
        });

      case 'config':
        return NextResponse.json({
          features: {
            voiceAgent: true,
            realTimeSTT: true,
            realTimeTTS: true,
            multiLanguage: true,
          },
          supportedLanguages: ['english', 'hindi'],
          models: {
            stt: 'nova-3',
            tts: 'aura-2-thalia-en',
          },
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Deepgram Voice Agent GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
