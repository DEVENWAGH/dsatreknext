import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// API route to securely provide Deepgram API key to client
export async function GET() {
  try {
    // Verify user is authenticated
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return Deepgram key from environment variables
    return NextResponse.json({
      success: true,
      key: process.env.DEEPGRAM_API_KEY,
    });
  } catch (error) {
    console.error('Error retrieving Deepgram API key:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API route for POST requests (if needed for additional voice agent configurations)
export async function POST(req) {
  try {
    // Verify user is authenticated
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();

    // Process any voice agent configuration requests
    // This is a placeholder for future functionality

    return NextResponse.json({
      success: true,
      message: 'Voice agent configuration updated',
    });
  } catch (error) {
    console.error('Error processing voice agent configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
