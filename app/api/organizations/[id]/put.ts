import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function putOrganization(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { name, organizationTypeId, location, contact } = body;

    const result = await db.update(organizations)
      .set({
        ...(name && { name }),
        ...(organizationTypeId && { organizationTypeId }),
        ...(location !== undefined && { location }),
        ...(contact !== undefined && { contact }),
      })
      .where(eq(organizations.id, id))
      .returning();

    if (result.length === 0) return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    return NextResponse.json({ message: 'Organization updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('[putOrganization]', err);
    return NextResponse.json({ message: 'Error updating organization' }, { status: 500 });
  }
}
