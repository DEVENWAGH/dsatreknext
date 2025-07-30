import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { db } from '@/lib/db';
import { Community, User } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const { problemId } = await params;

    const discussions = await db
      .select({
        id: Community.id,
        userId: Community.userId,
        username: Community.isAnonymous ? Community.username : User.username,
        title: Community.title,
        content: Community.content,
        isAnonymous: Community.isAnonymous,
        createdAt: Community.createdAt,
      })
      .from(Community)
      .leftJoin(User, eq(Community.userId, User.id))
      .where(eq(Community.title, problemId))
      .orderBy(desc(Community.createdAt));

    return NextResponse.json({
      success: true,
      data: discussions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error fetching discussions' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { problemId } = await params;
    const { content, isAnonymous = false } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newDiscussion = await db
      .insert(Community)
      .values({
        userId: session.user.id,
        username: isAnonymous ? 'Anonymous' : session.user.name,
        title: problemId,
        content,
        topic: 'Problem Discussion',
        isAnonymous,
        expiresAt,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newDiscussion[0],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error creating discussion' },
      { status: 500 }
    );
  }
}
