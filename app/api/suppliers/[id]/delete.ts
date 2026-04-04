import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';

export async function deleteSupplier(req: NextRequest, id: string, authUser: AuthenticatedUser) {
  try {
    const existing = await db.query.suppliers.findFirst({
      where: and(eq(suppliers.id, id), isNull(suppliers.deletedAt)),
    });
    if (!existing) {
      return NextResponse.json({ message: 'Supplier not found' }, { status: 404 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser || dbUser.organizationId !== existing.organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await db
      .update(suppliers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(suppliers.id, id));

    return NextResponse.json({ message: 'Supplier deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('[deleteSupplier]', err);
    return NextResponse.json({ message: 'Error deleting supplier' }, { status: 500 });
  }
}
