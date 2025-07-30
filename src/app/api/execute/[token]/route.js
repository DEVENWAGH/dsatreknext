import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    // Import auth dynamically
    const { auth } = await import('@/auth');
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { token } = await params;

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

    if (!judge0Response.ok) {
      return NextResponse.json(result, {
        status: judge0Response.status,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
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
