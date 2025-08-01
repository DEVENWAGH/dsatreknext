import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Community as posts, Comments as comments, UserProfile as users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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