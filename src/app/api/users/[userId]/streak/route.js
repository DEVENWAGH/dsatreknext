import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Submission } from '@/lib/schema/submission';
import { eq, and, desc } from 'drizzle-orm';

async function GET(request, { params }) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Get all accepted submissions for the user
    const acceptedSubmissions = await db
      .select({
        createdAt: Submission.createdAt,
        problemId: Submission.problemId,
      })
      .from(Submission)
      .where(
        and(eq(Submission.userId, userId), eq(Submission.status, 'accepted'))
      )
      .orderBy(desc(Submission.createdAt));

    // Group submissions by date and get unique problems solved per day
    const submissionsByDate = new Map();

    acceptedSubmissions.forEach(sub => {
      // Convert to IST (UTC+5:30)
      const utcDate = new Date(sub.createdAt);
      const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);
      const date = istDate.toISOString().split('T')[0];
      if (!submissionsByDate.has(date)) {
        submissionsByDate.set(date, new Set());
      }
      submissionsByDate.get(date).add(sub.problemId);
    });

    // Convert to array of dates with activity
    const activeDates = Array.from(submissionsByDate.keys())
      .map(date => ({
        date,
        count: submissionsByDate.get(date).size,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort dates in descending order for streak calculation
    const sortedDates = activeDates
      .map(item => new Date(item.date))
      .sort((a, b) => b - a);

    if (sortedDates.length > 0) {
      // Check if there's activity today or yesterday for current streak
      const latestActivity = sortedDates[0];
      const daysDiff = Math.floor(
        (today - latestActivity) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        // Calculate current streak
        let checkDate = new Date(latestActivity);
        currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(checkDate);
          prevDate.setDate(prevDate.getDate() - 1);

          if (sortedDates[i].getTime() === prevDate.getTime()) {
            currentStreak++;
            checkDate = sortedDates[i];
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      tempStreak = 1;
      longestStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i];
        const prevDate = sortedDates[i - 1];
        const daysDiff = Math.floor(
          (prevDate - currentDate) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    // Generate heatmap data for all time if no year specified, otherwise for the year
    const heatmapData = {};

    if (year && year !== new Date().getFullYear()) {
      // For specific year, initialize all dates in the year with 0
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split('T')[0];
        heatmapData[dateStr] = 0;
      }

      // Fill in actual activity data for the year
      activeDates.forEach(({ date, count }) => {
        if (
          date >= startDate.toISOString().split('T')[0] &&
          date <= endDate.toISOString().split('T')[0]
        ) {
          heatmapData[date] = count;
        }
      });
    } else {
      // For current year or all time, include all activity
      activeDates.forEach(({ date, count }) => {
        heatmapData[date] = count;
      });
    }

    // Convert heatmapData object to activeDays array for frontend compatibility
    const activeDays = activeDates.map(({ date, count }) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        totalActiveDays: activeDates.length,
        heatmapData,
        activeDays, // Add this for heatmap component
        year: year ? parseInt(year) : new Date().getFullYear(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching activity streak',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export { GET };
