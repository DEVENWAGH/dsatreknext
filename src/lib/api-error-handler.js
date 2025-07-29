import { NextResponse } from 'next/server';

export function handleApiError(error, context = '') {
  return NextResponse.json(
    {
      success: false,
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Something went wrong',
    },
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function validateDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    const { db } = await import('@/lib/db');
    await db.execute('SELECT 1');
    return true;
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export function createSuccessResponse(data, message = 'Success') {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
}

export function createErrorResponse(message, status = 400, error = null) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : null,
    },
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
