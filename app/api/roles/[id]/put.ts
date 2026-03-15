import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { roles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function putRole(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { name, description } = body;

    const result = await db.update(roles)
      .set({ ...(name && { name }), ...(description !== undefined && { description }) })
      .where(eq(roles.id, id))
      .returning();

    if (result.length === 0) return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    return NextResponse.json({ message: 'Role updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('[putRole]', err);
    return NextResponse.json({ message: 'Error updating role' }, { status: 500 });
  }
}
