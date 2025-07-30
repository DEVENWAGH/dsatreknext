import { handlers } from '@/auth';

export const runtime = 'nodejs';

const withErrorHandling = (handler) => async (req, context) => {
  try {
    const response = await handler(req, context);
    return response;
  } catch (error) {
    console.error('Auth handler error:', error);
    return Response.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }
};

export const GET = withErrorHandling(handlers.GET);
export const POST = withErrorHandling(handlers.POST);
