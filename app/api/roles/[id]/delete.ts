import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { roles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function deleteRole(id: string) {
  try {
    const result = await db.delete(roles)
      .where(eq(roles.id, id))
      .returning();

    if (result.length === 0) return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    return NextResponse.json({ message: 'Role deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('[deleteRole]', err);
    return NextResponse.json({ message: 'Error deleting role' }, { status: 500 });
  }
}
