import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { departments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getDepartments(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    const allDepts = await db.query.departments.findMany({
      where: organizationId ? eq(departments.organizationId, organizationId) : undefined,
    });
    return NextResponse.json({ data: allDepts, message: 'Departments fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getDepartments]', err);
    return NextResponse.json({ message: 'Error fetching departments' }, { status: 500 });
  }
}
