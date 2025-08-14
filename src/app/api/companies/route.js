import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { Company } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const companies = await db
      .select({
        id: Company.id,
        name: Company.name,
        company_url: Company.companyUrl,
      })
      .from(Company);

    return NextResponse.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching companies',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, companyUrl } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company name is required',
        },
        { status: 400 }
      );
    }
    const newCompany = await db
      .insert(Company)
      .values({
        name,
        companyUrl: companyUrl ? { url: companyUrl } : null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Company created successfully',
        data: newCompany[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating company',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
