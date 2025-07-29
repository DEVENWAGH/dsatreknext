import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Submission } from '@/lib/schema/submission';
import { Problem } from '@/lib/schema/problem';
import { User } from '@/lib/schema/user';
import { eq, and, count } from 'drizzle-orm';

const getLanguageName = languageId => {
  const languageMap = {
    50: 'C',
    54: 'C++',
    62: 'Java',
    71: 'Python',
    63: 'JavaScript',
    68: 'PHP',
    72: 'Ruby',
    73: 'Rust',
    60: 'Go',
    // Add display names as well
    c: 'C',
    'c++': 'C++',
    cpp: 'C++',
    java: 'Java',
    python: 'Python',
    javascript: 'JavaScript',
    php: 'PHP',
    ruby: 'Ruby',
    rust: 'Rust',
    go: 'Go',
  };
  return languageMap[languageId] || String(languageId);
};

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user exists
    const userResult = await db
      .select({
        id: User.id,
      })
      .from(User)
      .where(eq(User.id, userId))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get accepted submissions with problem details
    const acceptedSubmissions = await db
      .select({
        problemId: Submission.problemId,
        difficulty: Problem.difficulty,
        language: Submission.language,
      })
      .from(Submission)
      .innerJoin(Problem, eq(Submission.problemId, Problem.id))
      .where(
        and(eq(Submission.userId, userId), eq(Submission.status, 'accepted'))
      );

    // Get total submissions count
    const totalSubmissionsResult = await db
      .select({ count: count() })
      .from(Submission)
      .where(eq(Submission.userId, userId));

    const totalSubmissions = totalSubmissionsResult[0]?.count || 0;

    // Calculate unique solved problems by difficulty
    const uniqueProblems = new Map();
    acceptedSubmissions.forEach(sub => {
      if (!uniqueProblems.has(sub.problemId)) {
        uniqueProblems.set(
          sub.problemId,
          sub.difficulty?.toLowerCase() || 'unknown'
        );
      }
    });

    const solvedByDifficulty = { easy: 0, medium: 0, hard: 0 };
    uniqueProblems.forEach(difficulty => {
      if (difficulty in solvedByDifficulty) {
        solvedByDifficulty[difficulty]++;
      }
    });

    const totalSolved = uniqueProblems.size;

    // Calculate acceptance rate
    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((totalSolved / totalSubmissions) * 100)
        : 0;

    // Calculate solved by language (unique problems per language)
    const solvedByLanguage = {};
    const languageProblems = new Map();

    acceptedSubmissions.forEach(sub => {
      const lang = getLanguageName(sub.language || 'unknown');
      if (!languageProblems.has(lang)) {
        languageProblems.set(lang, new Set());
      }
      languageProblems.get(lang).add(sub.problemId);
    });

    languageProblems.forEach((problemSet, lang) => {
      solvedByLanguage[lang] = problemSet.size;
    });

    const stats = {
      totalSubmissions,
      totalSolved,
      acceptanceRate,
      solvedByDifficulty,
      solvedByLanguage,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('User statistics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
