import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await db
      .select()
      .from(User)
      .where(eq(User.id, userId))
      .limit(1);

    if (!user?.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user[0],
    });
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
