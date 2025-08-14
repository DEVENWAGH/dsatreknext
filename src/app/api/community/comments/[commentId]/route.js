import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Comments, User } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = await params;

    const [comment] = await db
      .select()
      .from(Comments)
      .where(eq(Comments.id, commentId))
      .limit(1);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user is admin or comment owner
    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.id, session.user.id))
      .limit(1);
    const isAdmin = user?.role === 'admin';
    const isOwner = comment.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await db.delete(Comments).where(eq(Comments.id, commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Handle both string and rich content
    const processedContent =
      typeof content === 'string' ? content.trim() : content;

    if (typeof content === 'string' && !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const [comment] = await db
      .select()
      .from(Comments)
      .where(eq(Comments.id, commentId))
      .limit(1);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only comment owner can edit (not admin)
    if (comment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const [updatedComment] = await db
      .update(Comments)
      .set({
        content: processedContent,
        updatedAt: new Date(),
      })
      .where(eq(Comments.id, commentId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
