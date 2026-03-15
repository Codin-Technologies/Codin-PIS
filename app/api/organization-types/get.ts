import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function getOrganizationTypes() {
  try {
    const allTypes = await db.query.organizationTypes.findMany();
    return NextResponse.json({ data: allTypes, message: 'Organization types fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getOrganizationTypes]', err);
    return NextResponse.json({ message: 'Error fetching organization types' }, { status: 500 });
  }
}
