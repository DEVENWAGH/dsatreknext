import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  Community as posts,
  Comments as comments,
  User,
  Votes,
} from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const { postId } = await params;
    console.log('Fetching post with ID:', postId);

    const session = await auth();
    const userId = session?.user?.id;
    console.log('User ID:', userId);

    const postData = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        topic: posts.topic,
        isAnonymous: posts.isAnonymous,
        createdAt: posts.createdAt,
        userId: posts.userId,
        username: posts.username,
        profilePicture: User.profilePicture,
      })
      .from(posts)
      .leftJoin(User, eq(posts.userId, User.id))
      .where(eq(posts.id, postId))
      .limit(1);

    console.log(
      'Post data fetched:',
      postData.length > 0 ? 'Found' : 'Not found'
    );

    if (postData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = postData[0];
    console.log('Post content type:', typeof post.content);
    console.log('Post content value:', post.content);

    // Create a safe copy of the post to avoid any reference issues
    const safePost = {
      id: post.id,
      title: post.title,
      topic: post.topic,
      isAnonymous: post.isAnonymous,
      createdAt: post.createdAt,
      userId: post.userId,
      username: post.username,
      profilePicture: post.profilePicture,
      content: null, // Will be set below
    };

    // Safely handle content
    try {
      if (post.content === null || post.content === undefined) {
        safePost.content = null;
      } else if (typeof post.content === 'string') {
        try {
          safePost.content = JSON.parse(post.content);
        } catch {
          safePost.content = post.content;
        }
      } else if (typeof post.content === 'object') {
        // Deep clone to avoid reference issues
        safePost.content = JSON.parse(JSON.stringify(post.content));
      } else {
        safePost.content = String(post.content);
      }
    } catch (error) {
      console.error('Error processing content:', error);
      safePost.content = null;
    }

    console.log('Safe post content after processing:', typeof safePost.content);

    // Set default values to avoid undefined issues
    safePost.comments = [];
    safePost.votes = 0;
    safePost.userVote = null;

    console.log('About to return post data');
    console.log('Safe post object keys:', Object.keys(safePost));
    console.log('Safe post content final:', safePost.content);

    return NextResponse.json({
      success: true,
      data: safePost,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    console.error('Error stack:', error.stack);
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
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is admin or post owner
    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.id, session.user.id))
      .limit(1);
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
