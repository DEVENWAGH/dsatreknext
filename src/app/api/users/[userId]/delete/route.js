import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  User,
  Comments,
  Community,
  Votes,
  Submission,
  interviews,
} from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Only allow users to delete their own account or admin to delete any
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete all related data in correct order (child tables first)
    await db.transaction(async tx => {
      // Delete comments
      await tx.delete(Comments).where(eq(Comments.userId, userId));

      // Delete votes
      await tx.delete(Votes).where(eq(Votes.userId, userId));

      // Delete community posts
      await tx.delete(Community).where(eq(Community.userId, userId));

      // Delete submissions (this contains all analytics data)
      await tx.delete(Submission).where(eq(Submission.userId, userId));

      // Delete interviews
      await tx.delete(interviews).where(eq(interviews.userId, userId));

      // Finally delete the user
      await tx.delete(User).where(eq(User.id, userId));
    });

    return NextResponse.json({
      success: true,
      message: 'Account and all related data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
