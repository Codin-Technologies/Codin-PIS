import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserById(id: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 200 });
  } catch (err) {
    console.error('[getUserById]', err);
    return NextResponse.json({ message: 'Error fetching user' }, { status: 500 });
  }
}
