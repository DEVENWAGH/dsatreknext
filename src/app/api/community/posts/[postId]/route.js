import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Community as posts, Comments as comments, User } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const { postId } = await params;

    const postData = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        topic: posts.topic,
        votes: posts.votes,
        isAnonymous: posts.isAnonymous,
        createdAt: posts.createdAt,
        userId: posts.userId,
        username: posts.username,
      })
      .from(posts)

      .where(eq(posts.id, postId))
      .limit(1);

    if (postData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = postData[0];

    // Get comments for the post
    const postComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        userId: comments.userId,
        username: comments.username,
      })
      .from(comments)

      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);

    post.comments = postComments;

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { postId } = await params;

    // Get post to check ownership
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is admin or post owner
    const [user] = await db.select().from(User).where(eq(User.id, session.user.id)).limit(1);
    const isAdmin = user?.role === 'admin';
    const isOwner = post.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Delete comments first
    await db.delete(comments).where(eq(comments.postId, postId));
    
    // Delete post
    await db.delete(posts).where(eq(posts.id, postId));

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}