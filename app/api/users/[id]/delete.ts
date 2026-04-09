import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function deleteUser(id: string) {
  try {
    const now = new Date();
    const result = await db
      .update(users)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();

    if (result.length === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ message: 'User deactivated successfully' }, { status: 200 });
  } catch (err) {
    console.error('[deleteUser]', err);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}
