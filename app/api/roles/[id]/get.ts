import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { roles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getRoleById(id: string) {
  try {
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    });
    if (!role) return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    return NextResponse.json(role, { status: 200 });
  } catch (err) {
    console.error('[getRoleById]', err);
    return NextResponse.json({ message: 'Error fetching role' }, { status: 500 });
  }
}
