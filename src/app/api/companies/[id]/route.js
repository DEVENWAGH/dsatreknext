import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { db } from '@/lib/db';
import { Company } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid company ID format',
        },
        { status: 400 }
      );
    }

    const company = await db
      .select()
      .from(Company)
      .where(eq(Company.id, id))
      .limit(1);

    if (company.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company[0],
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching company',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, companyUrl } = body;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid company ID format',
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company name is required',
        },
        { status: 400 }
      );
    }

    // Check if company exists
    const existingCompany = await db
      .select()
      .from(Company)
      .where(eq(Company.id, id))
      .limit(1);

    if (existingCompany.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company not found',
        },
        { status: 404 }
      );
    }
    const updatedCompany = await db
      .update(Company)
      .set({
        name,
        companyUrl: companyUrl ? { url: companyUrl } : null,
        updatedAt: new Date(),
      })
      .where(eq(Company.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany[0],
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating company',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid company ID format',
        },
        { status: 400 }
      );
    }

    // Check if company exists
    const existingCompany = await db
      .select()
      .from(Company)
      .where(eq(Company.id, id))
      .limit(1);

    if (existingCompany.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company not found',
        },
        { status: 404 }
      );
    }

    // Delete the company
    await db.delete(Company).where(eq(Company.id, id));

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error deleting company',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
