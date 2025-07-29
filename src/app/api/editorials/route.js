import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');
    const difficulty = searchParams.get('difficulty');

    // Mock data for now since Editorial table might not exist yet
    const mockEditorials = [
      {
        id: '1',
        problemId: problemId || '1',
        title: 'Two Sum - Multiple Approaches',
        content: 'This problem can be solved using multiple approaches...',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table'],
        upvotes: 245,
        downvotes: 12,
        isPublished: true,
        createdAt: new Date().toISOString(),
        user: {
          id: '1',
          username: 'algorithm_expert',
          profilePicture: null,
        },
      },
      {
        id: '2',
        problemId: problemId || '2',
        title: 'Binary Search Implementation',
        content: 'Binary search is a fundamental algorithm...',
        difficulty: 'Medium',
        tags: ['Binary Search', 'Algorithms'],
        upvotes: 189,
        downvotes: 8,
        isPublished: true,
        createdAt: new Date().toISOString(),
        user: {
          id: '2',
          username: 'code_master',
          profilePicture: null,
        },
      },
    ];

    let filteredEditorials = mockEditorials;

    if (problemId) {
      filteredEditorials = filteredEditorials.filter(
        e => e.problemId === problemId
      );
    }

    if (difficulty) {
      filteredEditorials = filteredEditorials.filter(
        e => e.difficulty === difficulty
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredEditorials,
    });
  } catch (error) {
    console.error('Error fetching editorials:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching editorials',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { problemId, userId, title, content, difficulty, tags } = body;

    if (!problemId || !userId || !title || !content) {
      return NextResponse.json(
        {
          success: false,
          message: 'Problem ID, User ID, title, and content are required',
        },
        { status: 400 }
      );
    }

    // Mock creation for now
    const newEditorial = {
      id: Date.now().toString(),
      problemId,
      userId,
      title,
      content,
      difficulty: difficulty || 'Medium',
      tags: tags || [],
      upvotes: 0,
      downvotes: 0,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Editorial created successfully',
        data: newEditorial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating editorial:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating editorial',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
