import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function putUser(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { fullName, email, roleId, organizationId } = body;

    // Build only the fields that were actually provided
    const updatePayload: Record<string, unknown> = {};
    if (fullName) updatePayload.fullName = fullName;
    if (email) updatePayload.email = email;
    if (roleId) updatePayload.roleId = roleId;             // assign to a new role
    if (organizationId) updatePayload.organizationId = organizationId; // assign to a company

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ message: 'No fields provided to update' }, { status: 400 });
    }

    const result = await db.update(users)
      .set(updatePayload)
      .where(eq(users.id, id))
      .returning();

    if (result.length === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ data: result[0], message: 'User updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('[putUser]', err);
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}
