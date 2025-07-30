import { auth } from '@/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    return Response.json(session || {});
  } catch (error) {
    console.error('Session error:', error);
    return Response.json({});
  }
}

export async function POST(req) {
  try {
    const { handlers } = await import('@/auth');
    return handlers.POST(req);
  } catch (error) {
    console.error('Auth POST error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
