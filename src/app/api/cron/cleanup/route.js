import { NextResponse } from 'next/server';

// This endpoint will be called by Vercel Cron Jobs
export async function GET(request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the room cleanup function
    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const cleanupResponse = await fetch(`${baseUrl}/api/rooms/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!cleanupResponse.ok) {
      throw new Error(`Cleanup failed: ${cleanupResponse.statusText}`);
    }

    const result = await cleanupResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      cleaned: result.cleaned,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request) {
  return GET(request);
}
