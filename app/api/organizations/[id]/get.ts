import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getOrganizationById(id: string) {
  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, id),
      with: {
        organizationType: true,
        users: {
          columns: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
    if (!org) return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    return NextResponse.json({ data: org }, { status: 200 });
  } catch (err) {
    console.error('[getOrganizationById]', err);
    return NextResponse.json({ message: 'Error fetching organization' }, { status: 500 });
  }
}
