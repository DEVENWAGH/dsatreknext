import { auth } from '@/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    return new Response(JSON.stringify(session || {}), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Session error:', error);
    return new Response('{}', {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const { handlers } = await import('@/auth');
    return await handlers.POST(req);
  } catch (error) {
    console.error('Auth POST error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
