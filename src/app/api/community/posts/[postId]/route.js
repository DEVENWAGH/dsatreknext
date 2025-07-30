import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Community } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;

    const [post] = await db
      .select()
      .from(Community)
      .where(eq(Community.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await db.delete(Community).where(eq(Community.id, postId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
