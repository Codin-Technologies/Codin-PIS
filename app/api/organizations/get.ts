import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function getOrganizations() {
  try {
    const allOrgs = await db.query.organizations.findMany();
    return NextResponse.json(allOrgs, { status: 200 });
  } catch (err) {
    console.error('[getOrganizations]', err);
    return NextResponse.json({ message: 'Error fetching organizations' }, { status: 500 });
  }
}
