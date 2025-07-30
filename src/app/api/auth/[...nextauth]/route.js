import { handlers } from '@/auth';

export const runtime = 'nodejs';

const withErrorHandling = (handler) => async (req, context) => {
  try {
    return await handler(req, context);
  } catch (error) {
    console.error('Auth handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication service temporarily unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const GET = withErrorHandling(handlers.GET);
export const POST = withErrorHandling(handlers.POST);
