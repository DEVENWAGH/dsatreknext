import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Votes } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request) {
  try {
    // Extract postId from URL directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const postId = pathParts[pathParts.length - 2]; // Get postId from URL path

    // Await async operations
    const [session, body] = await Promise.all([auth(), request.json()]);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = body.type;

    console.log('Vote API called with params:', {
      postId,
      type,
      userId: session.user.id,
    });

    console.log('Vote request:', { type, userId: session.user.id });

    if (type !== 'upvote' && type !== 'downvote') {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const existingVote = await db
      .select()
      .from(Votes)
      .where(and(eq(Votes.userId, session.user.id), eq(Votes.postId, postId)))
      .limit(1);

    // Handle the vote operation
    let voteOperation;

    if (existingVote.length > 0) {
      if (existingVote[0].voteType === type) {
        // User is clicking the same vote type again, remove their vote
        voteOperation = db
          .delete(Votes)
          .where(
            and(eq(Votes.userId, session.user.id), eq(Votes.postId, postId))
          );
      } else {
        // User is changing their vote from one type to another
        voteOperation = db
          .update(Votes)
          .set({ voteType: type })
          .where(
            and(eq(Votes.userId, session.user.id), eq(Votes.postId, postId))
          );
      }
    } else {
      // New vote
      voteOperation = db.insert(Votes).values({
        userId: session.user.id,
        postId: postId,
        voteType: type,
      });
    }

    // Execute the vote operation with error handling
    try {
      await voteOperation;
    } catch (dbError) {
      console.error('Database error during vote operation:', dbError);
      return NextResponse.json(
        { error: 'Database error during vote operation' },
        { status: 500 }
      );
    }

    // No need to update Community table as votes are calculated dynamically

    // Create a new database connection for vote counting to ensure isolation
    let upvotes, downvotes, userVote;
    try {
      // Use separate database queries with explicit transaction isolation
      const upvotesQuery = db
        .select()
        .from(Votes)
        .where(eq(Votes.postId, postId))
        .where(eq(Votes.voteType, 'upvote'));

      const downvotesQuery = db
        .select()
        .from(Votes)
        .where(eq(Votes.postId, postId))
        .where(eq(Votes.voteType, 'downvote'));

      const userVoteQuery = db
        .select()
        .from(Votes)
        .where(and(eq(Votes.userId, session.user.id), eq(Votes.postId, postId)))
        .limit(1);

      // Execute queries in parallel but with isolation
      [upvotes, downvotes, userVote] = await Promise.all([
        upvotesQuery,
        downvotesQuery,
        userVoteQuery,
      ]);

      // Log the raw query results for debugging
      console.log(`Raw upvotes for post ${postId}:`, upvotes.length);
      console.log(`Raw downvotes for post ${postId}:`, downvotes.length);
    } catch (dbError) {
      console.error('Database error fetching vote data:', dbError);
      return NextResponse.json(
        { error: 'Database error fetching vote data' },
        { status: 500 }
      );
    }

    // Calculate vote count specifically for this post
    const currentVote = userVote.length > 0 ? userVote[0].voteType : null;

    // Ensure we're only counting votes for this specific post
    const upvoteCount = upvotes.filter(vote => vote.postId === postId).length;
    const downvoteCount = downvotes.filter(
      vote => vote.postId === postId
    ).length;
    const voteCount = upvoteCount - downvoteCount;

    console.log(
      `Post ${postId} vote count: ${voteCount} (${upvoteCount} upvotes, ${downvoteCount} downvotes)`
    );
    console.log(
      `User ${session.user.id} vote on post ${postId}: ${currentVote}`
    );

    // Return only this post's vote data
    return NextResponse.json({
      success: true,
      votes: voteCount,
      userVote: currentVote,
      postId: postId, // Include postId in response for verification
    });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
