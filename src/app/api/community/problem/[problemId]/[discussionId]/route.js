import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { db } from '@/lib/db';
import { Community } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth';

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { discussionId } = await params;

    const result = await db
      .delete(Community)
      .where(
        and(
          eq(Community.id, discussionId),
          eq(Community.userId, session.user.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Discussion not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Discussion deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error deleting discussion' },
      { status: 500 }
    );
  }
}
