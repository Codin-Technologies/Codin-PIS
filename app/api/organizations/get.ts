import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AuthenticatedUser } from '@/lib/auth/utils';

export async function getOrganizations(user: AuthenticatedUser) {
  try {
    const orgs = await db.query.organizations.findMany({
      where: eq(organizations.id, user.organizationId ?? ''),
      with: {
        organizationType: true,
        users: {
          columns: {
            id: true,
          },
        },
      },
    });
    return NextResponse.json({ data: orgs, message: 'Organizations fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getOrganizations]', err);
    return NextResponse.json({ message: 'Error fetching organizations' }, { status: 500 });
  }
}
