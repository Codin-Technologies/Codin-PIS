import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { supplierToDto } from '@/lib/procurement/supplier-dto';
import type { AuthenticatedUser } from '@/lib/auth/utils';

export async function getSupplierById(req: NextRequest, id: string, authUser: AuthenticatedUser) {
  try {
    const row = await db.query.suppliers.findFirst({
      where: and(eq(suppliers.id, id), isNull(suppliers.deletedAt)),
    });
    if (!row) {
      return NextResponse.json({ message: 'Supplier not found' }, { status: 404 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser || dbUser.organizationId !== row.organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { data: supplierToDto(row), message: 'Supplier fetched successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[getSupplierById]', err);
    return NextResponse.json({ message: 'Error fetching supplier' }, { status: 500 });
  }
}
