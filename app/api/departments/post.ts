import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { departments } from '@/lib/db/schema';

export async function postDepartment(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, organizationId } = body;

    if (!name || !organizationId) {
      return NextResponse.json({ message: 'name and organizationId are required' }, { status: 400 });
    }

    const [dept] = await db.insert(departments).values({ name, organizationId }).returning();
    return NextResponse.json({ data: dept, message: 'Department created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postDepartment]', err);
    return NextResponse.json({ message: 'Error creating department' }, { status: 500 });
  }
}
