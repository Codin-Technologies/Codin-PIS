import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AuthenticatedUser } from '@/lib/auth/utils';

export async function getUsers(user: AuthenticatedUser) {
  try {
    const allUsers = await db.query.users.findMany({
      where: eq(users.organizationId, user.organizationId ?? ''),
      with: {
        role: true,
        organization: true,
      },
    });
    
    // Strip passwordHash and map relational names for frontend
    const safeUsers = allUsers.map(({ passwordHash, role, organization, ...rest }) => ({
      ...rest,
      roleName: role?.name,
      branchName: organization?.name,
    }));

    return NextResponse.json({ data: safeUsers, message: 'Users fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getUsers]', err);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}
