import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { Problem, Submission } from '@/lib/schema';
import { eq, count, sql, asc } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fields = searchParams.get('fields');
    const showAll = searchParams.get('showAll') === 'true';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Select fields based on request
    let query = db.select();
    if (fields) {
      const fieldList = fields.split(',');
      const selectFields = {};
      fieldList.forEach(field => {
        if (field === 'id') selectFields.id = Problem.id;
        if (field === 'title') selectFields.title = Problem.title;
        if (field === 'difficulty')
          selectFields.difficulty = Problem.difficulty;
        if (field === 'tags') selectFields.tags = Problem.tags;
        if (field === 'companies') selectFields.companies = Problem.companies;
        if (field === 'is_premium') selectFields.is_premium = Problem.isPremium;
        if (field === 'is_active') selectFields.is_active = Problem.isActive;
      });
      query = db.select(selectFields);
    }

    // Get total count first
    const totalCountQuery = showAll
      ? db.select({ count: count() }).from(Problem)
      : db
          .select({ count: count() })
          .from(Problem)
          .where(eq(Problem.isActive, true));

    const [{ count: totalCount }] = await totalCountQuery;

    // Get paginated problems
    let problems;
    if (showAll) {
      problems = await query
        .from(Problem)
        .orderBy(
          sql`CAST(SUBSTRING(${Problem.title} FROM '[0-9]+') AS INTEGER)`
        )
        .limit(limit)
        .offset(offset);
    } else {
      problems = await query
        .from(Problem)
        .where(eq(Problem.isActive, true))
        .orderBy(
          sql`CAST(SUBSTRING(${Problem.title} FROM '[0-9]+') AS INTEGER)`
        )
        .limit(limit)
        .offset(offset);
    }

    // Get submission statistics for each problem
    const problemsWithStats = await Promise.all(
      problems.map(async problem => {
        try {
          const stats = await db
            .select({
              totalSubmissions: sql`COALESCE(COUNT(${Submission.id}), 0)`,
              acceptedSubmissions: sql`COALESCE(SUM(CASE WHEN ${Submission.status} = 'accepted' THEN 1 ELSE 0 END), 0)`,
            })
            .from(Submission)
            .where(eq(Submission.problemId, problem.id));

          return {
            ...problem,
            totalSubmissions: parseInt(stats[0]?.totalSubmissions) || 0,
            acceptedSubmissions: parseInt(stats[0]?.acceptedSubmissions) || 0,
          };
        } catch (error) {
          console.error(
            `Error fetching stats for problem ${problem.id}:`,
            error
          );
          return {
            ...problem,
            totalSubmissions: 0,
            acceptedSubmissions: 0,
          };
        }
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          problems: problemsWithStats,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page < Math.ceil(totalCount / limit),
            hasPrev: page > 1,
          },
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Problems API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      editorial,
      difficulty,
      tags,
      companies,
      starterCode,
      topCode,
      bottomCode,
      solution,
      testCases,
      hints,
      isPremium,
    } = body;

    // Handle data from admin create form
    if (!title || !difficulty) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title and difficulty are required',
        },
        { status: 400 }
      );
    }

    // Validate description content
    if (!description || !Array.isArray(description)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Description is required and must be in proper format',
        },
        { status: 400 }
      );
    }

    // Convert testCases to examples format for backward compatibility
    if (testCases && Array.isArray(testCases)) {
      testCases.map((testCase, index) => ({
        id: index + 1,
        input: testCase.input || '',
        output: testCase.output || '',
        explanation: `Example ${index + 1}`,
      }));
    }

    const newProblem = await db
      .insert(Problem)
      .values({
        title,
        description: description,
        editorial: editorial || null,
        difficulty,
        tags: tags || [],
        starterCode: starterCode || {},
        topCode: topCode || {},
        bottomCode: bottomCode || {},
        solution: solution || {},
        testCases: testCases || [],
        hints: hints || [],
        companies: companies || [],
        isPremium: isPremium || false,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Problem created successfully',
        data: newProblem[0],
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating problem',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
