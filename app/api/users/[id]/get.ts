import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function getUserById(id: string) {
  try {
    const user = await db.query.users.findFirst({
      where: and(eq(users.id, id), isNull(users.deletedAt)),
      with: {
        role: true,
        organization: true,
      },
    });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const { passwordHash: _passwordHash, role, organization, ...safeUser } = user;
    void _passwordHash;
    return NextResponse.json({ 
      data: {
        ...safeUser,
        roleName: role?.name,
        branchName: organization?.name,
      } 
    }, { status: 200 });
  } catch (err) {
    console.error('[getUserById]', err);
    return NextResponse.json({ message: 'Error fetching user' }, { status: 500 });
  }
}
