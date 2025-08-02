import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Feedback, User } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const session = await auth();
    const { message, email, name } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate word count (500 words limit)
    const wordCount = message
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    if (wordCount > 500) {
      return NextResponse.json(
        { success: false, error: 'Message cannot exceed 500 words' },
        { status: 400 }
      );
    }

    const feedbackData = {
      message: message.trim(),
      type: 'general',
      status: 'pending',
    };

    // If user is logged in, get their info from database
    if (session?.user) {
      const [user] = await db
        .select({
          id: User.id,
          email: User.email,
          firstName: User.firstName,
          lastName: User.lastName,
        })
        .from(User)
        .where(eq(User.id, session.user.id))
        .limit(1);

      if (user) {
        feedbackData.userId = user.id;
        feedbackData.email = user.email;
        feedbackData.name =
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      }
    } else {
      // For anonymous feedback, require email and name
      if (!email || !name) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email and name are required for anonymous feedback',
          },
          { status: 400 }
        );
      }
      feedbackData.email = email;
      feedbackData.name = name;
    }

    const [feedback] = await db
      .insert(Feedback)
      .values(feedbackData)
      .returning();

    return NextResponse.json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await auth();

    // Only allow admin access
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(Feedback);

    if (status && status !== 'all') {
      query = query.where(eq(Feedback.status, status));
    }

    const feedback = await query
      .orderBy(Feedback.createdAt)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();

    // Only allow admin access
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const [updatedFeedback] = await db
      .update(Feedback)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(Feedback.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedFeedback,
      message: 'Feedback status updated successfully',
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();

    // Only allow admin access
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const [deletedFeedback] = await db
      .delete(Feedback)
      .where(eq(Feedback.id, id))
      .returning();

    if (!deletedFeedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
