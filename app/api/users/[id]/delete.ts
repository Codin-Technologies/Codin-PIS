import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function deleteUser(id: string) {
  try {
    const result = await db.delete(users)
      .where(eq(users.id, id))
      .returning();

    if (result.length === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('[deleteUser]', err);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}
