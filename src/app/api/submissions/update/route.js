import { NextResponse } from 'next/server';

export async function PATCH() {
  try {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid route. Use /api/submissions/update/[id]',
      },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
