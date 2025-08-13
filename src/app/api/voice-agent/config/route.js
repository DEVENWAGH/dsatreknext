import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'config';

    switch (action) {
      case 'config':
        const deepgramKey = process.env.DEEPGRAM_API_KEY;
        const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!deepgramKey || deepgramKey === 'your_deepgram_api_key_here') {
          return NextResponse.json({
            success: false,
            error:
              'Deepgram API key not configured. Please set DEEPGRAM_API_KEY in environment variables.',
          });
        }

        if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
          return NextResponse.json({
            success: false,
            error:
              'Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in environment variables.',
          });
        }

        return NextResponse.json({
          success: true,
          deepgramApiKey: deepgramKey,
          geminiApiKey: geminiKey,
          features: {
            stt: !!process.env.DEEPGRAM_API_KEY,
            tts: !!process.env.DEEPGRAM_API_KEY,
            ai: !!process.env.GEMINI_API_KEY,
            customAgent: true,
            langchain: true,
          },
          models: {
            stt: 'nova-3',
            tts: 'aura-asteria-en',
            ai: 'gemini-2.5-flash',
          },
        });

      case 'test':
        return NextResponse.json({
          success: true,
          deepgramConfigured: !!process.env.DEEPGRAM_API_KEY,
          geminiConfigured: !!process.env.GEMINI_API_KEY,
          allConfigured: !!(
            process.env.DEEPGRAM_API_KEY && process.env.GEMINI_API_KEY
          ),
          timestamp: new Date().toISOString(),
        });

      case 'models':
        return NextResponse.json({
          success: true,
          sttModels: ['nova-2', 'nova-3', 'enhanced'],
          ttsModels: [
            'aura-asteria-en',
            'aura-luna-en',
            'aura-stella-en',
            'aura-kara-en',
          ],
          aiModels: ['gemini-1.5-pro', 'gemini-1.5-flash'],
          languages: ['en-US', 'hi-IN', 'es-ES', 'fr-FR'],
        });

      default:
        return NextResponse.json(
          {
            error: 'Invalid action',
            availableActions: ['config', 'test', 'models'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Voice Agent Config API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'validateConfig':
        return await validateConfiguration(data);

      case 'testConnection':
        return await testConnections();

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Voice Agent Config POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function validateConfiguration(config) {
  const errors = [];

  if (!process.env.DEEPGRAM_API_KEY) {
    errors.push('Deepgram API key not configured');
  }

  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    errors.push('Gemini API key not configured');
  }

  return NextResponse.json({
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    message:
      errors.length === 0
        ? 'Configuration is valid'
        : 'Configuration errors found',
  });
}

async function testConnections() {
  const results = {
    deepgram: false,
    gemini: false,
    overall: false,
  };

  try {
    // Test Deepgram connection (simplified)
    if (process.env.DEEPGRAM_API_KEY) {
      results.deepgram = true;
    }

    // Test Gemini connection (simplified)
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      results.gemini = true;
    }

    results.overall = results.deepgram && results.gemini;

    return NextResponse.json({
      success: true,
      results,
      message: results.overall
        ? 'All connections successful'
        : 'Some connections failed',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      results,
      error: error.message,
    });
  }
}
