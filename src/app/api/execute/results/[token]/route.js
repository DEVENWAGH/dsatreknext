import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { auth } = await import('@/auth');
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { token } = await params;
    console.log('Fetching results for token:', token);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    // Get results from Judge0
    const judge0Response = await fetch(
      `${process.env.JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await judge0Response.json();
    console.log('Judge0 result for token', token, ':', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching Judge0 results:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
