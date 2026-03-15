import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function deleteOrganization(id: string) {
  try {
    const result = await db.delete(organizations)
      .where(eq(organizations.id, id))
      .returning();

    if (result.length === 0) return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    return NextResponse.json({ message: 'Organization deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('[deleteOrganization]', err);
    return NextResponse.json({ message: 'Error deleting organization' }, { status: 500 });
  }
}
