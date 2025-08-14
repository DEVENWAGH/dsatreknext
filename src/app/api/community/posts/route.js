import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Community, Comments, User, Votes } from '@/lib/schema';
import { desc, eq, ne } from 'drizzle-orm';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, isAnonymous, topic } = await request.json();

    if (!title?.trim() || !content) {
      return NextResponse.json(
        { error: 'Title and content required' },
        { status: 400 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [post] = await db
      .insert(Community)
      .values({
        userId: session.user.id,
        username: session.user.name,
        title: title.trim(),
        content,
        topic: topic || 'Interview',
        isAnonymous: !!isAnonymous,
        expiresAt,
      })
      .returning();

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const posts = await db
      .select({
        id: Community.id,
        userId: Community.userId,
        username: Community.username,
        title: Community.title,
        content: Community.content,
        topic: Community.topic,
        isAnonymous: Community.isAnonymous,
        createdAt: Community.createdAt,
        expiresAt: Community.expiresAt,
        profilePicture: User.profilePicture,
      })
      .from(Community)
      .leftJoin(User, eq(Community.userId, User.id))
      .where(ne(Community.topic, 'Problem Discussion'))
      .orderBy(desc(Community.createdAt)) // Will sort by votes after processing
      .limit(limit + 1)
      .offset(offset);

    const postsWithCommentsAndVotes = await Promise.all(
      posts.map(async post => {
        // Create a unique scope for each post to prevent vote count leakage
        const postId = post.id; // Store post ID in local variable

        // Ensure content is properly formatted
        if (post.content && typeof post.content === 'object') {
          // If content is already an object, keep it as is
          post.content = post.content;
        } else if (typeof post.content === 'string') {
          try {
            // Try to parse if it's a JSON string
            post.content = JSON.parse(post.content);
          } catch {
            // If parsing fails, keep as string
            post.content = post.content;
          }
        } else {
          // Fallback for null/undefined content
          post.content = null;
        }

        try {
          const comments = await db
            .select({
              id: Comments.id,
              postId: Comments.postId,
              userId: Comments.userId,
              username: Comments.username,
              content: Comments.content,
              createdAt: Comments.createdAt,
            })
            .from(Comments)
            .where(eq(Comments.postId, postId)) // Use local postId variable
            .orderBy(desc(Comments.createdAt));

          // Calculate votes for each post - count upvotes and downvotes separately
          // Use explicit transaction isolation for each post
          const [upvotes, downvotes] = await Promise.all([
            db
              .select()
              .from(Votes)
              .where(eq(Votes.postId, postId)) // Use local postId variable
              .where(eq(Votes.voteType, 'upvote')),

            db
              .select()
              .from(Votes)
              .where(eq(Votes.postId, postId)) // Use local postId variable
              .where(eq(Votes.voteType, 'downvote')),
          ]);

          // Calculate net votes (upvotes minus downvotes) for this specific post only
          const upvoteCount = upvotes.filter(
            vote => vote.postId === postId
          ).length;
          const downvoteCount = downvotes.filter(
            vote => vote.postId === postId
          ).length;
          const votes = upvoteCount - downvoteCount;

          console.log(
            `GET: Post ${postId} has ${upvoteCount} upvotes and ${downvoteCount} downvotes = ${votes} net votes`
          );

          // Check if current user has voted on this post
          let userVote = null;
          if (userId) {
            try {
              const userVoteRecord = await db
                .select({ voteType: Votes.voteType, postId: Votes.postId })
                .from(Votes)
                .where(eq(Votes.postId, postId))
                .where(eq(Votes.userId, userId))
                .limit(1);

              // Verify this vote belongs to the current post
              if (
                userVoteRecord.length > 0 &&
                userVoteRecord[0].postId === postId
              ) {
                userVote = userVoteRecord[0].voteType;
                console.log(
                  `User ${userId} has ${userVote} vote on post ${postId}`
                );
              }
            } catch (voteError) {
              console.error(
                `Error getting user vote for post ${postId}:`,
                voteError
              );
            }
          }

          // Return post data with isolated vote information
          return {
            ...post,
            comments,
            votes,
            userVote,
            _postIdVerification: postId, // Add verification field
          };
        } catch (error) {
          console.error(`Error processing post ${postId}:`, error);
          return {
            ...post,
            comments: [],
            votes: 0,
            userVote: null,
            _postIdVerification: postId, // Add verification field even in error case
          };
        }
      })
    );

    // Verify each post has the correct vote data before returning
    const verifiedPosts = postsWithCommentsAndVotes.map(post => {
      // Ensure post ID verification matches
      if (post._postIdVerification !== post.id) {
        console.error(
          `Post ID verification failed: ${post._postIdVerification} !== ${post.id}`
        );
        // Reset votes to 0 if verification fails
        return { ...post, votes: 0, userVote: null };
      }

      // Remove verification field before sending to client
      const { _postIdVerification, ...cleanPost } = post;
      return cleanPost;
    });

    // Sort posts by votes (highest first), then by creation date
    const sortedPosts = verifiedPosts.sort((a, b) => {
      if (b.votes !== a.votes) {
        return b.votes - a.votes; // Higher votes first
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // Newer first if votes are equal
    });

    const hasMore = sortedPosts.length > limit;
    const postsToReturn = hasMore ? sortedPosts.slice(0, limit) : sortedPosts;

    return NextResponse.json({
      posts: postsToReturn,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
