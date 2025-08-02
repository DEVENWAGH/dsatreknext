import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Comments } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { postId } = await params;
    
    const comments = await db
      .select()
      .from(Comments)
      .where(eq(Comments.postId, postId))
      .orderBy(desc(Comments.createdAt));

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }

    const [comment] = await db
      .insert(Comments)
      .values({
        postId: postId,
        userId: session.user.id,
        username: session.user.name,
        content: content.trim(),
      })
      .returning();

    return NextResponse.json({ success: true, data: comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
