import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';

export async function postOrganization(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, organizationTypeId, location, contact } = body;

    if (!name || !organizationTypeId) {
      return NextResponse.json({ message: 'Name and organizationTypeId are required' }, { status: 400 });
    }

    const [organization] = await db.insert(organizations).values({ name, organizationTypeId, location, contact }).returning();
    return NextResponse.json({ data: organization, message: 'Organization created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postOrganization]', err);
    return NextResponse.json({ message: 'Error creating organization' }, { status: 500 });
  }
}
