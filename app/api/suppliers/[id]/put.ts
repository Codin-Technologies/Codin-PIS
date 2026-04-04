import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';
import { supplierToDto } from '@/lib/procurement/supplier-dto';

export async function putSupplier(req: NextRequest, id: string, authUser: AuthenticatedUser) {
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

    const body = await req.json();
    const {
      name,
      category,
      contactPerson,
      email,
      phone,
      website,
      vatNumber,
      paymentTerms,
      streetAddress,
      status,
    } = body;

    const patch: Partial<typeof suppliers.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (name !== undefined) patch.name = String(name).trim();
    if (category !== undefined) patch.category = String(category).trim();
    if (contactPerson !== undefined) patch.contactPerson = contactPerson?.trim() || null;
    if (email !== undefined) patch.email = email?.trim() || null;
    if (phone !== undefined) patch.phone = phone?.trim() || null;
    if (website !== undefined) patch.website = website?.trim() || null;
    if (vatNumber !== undefined) patch.vatNumber = vatNumber?.trim() || null;
    if (paymentTerms !== undefined) patch.paymentTerms = paymentTerms?.trim() || null;
    if (streetAddress !== undefined) patch.streetAddress = streetAddress?.trim() || null;
    if (status !== undefined) patch.status = String(status).trim();

    if (patch.name === '' || patch.category === '') {
      return NextResponse.json({ message: 'name and category cannot be empty' }, { status: 400 });
    }

    const [row] = await db.update(suppliers).set(patch).where(eq(suppliers.id, id)).returning();
    if (!row) {
      return NextResponse.json({ message: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json(
      { data: supplierToDto(row), message: 'Supplier updated successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[putSupplier]', err);
    return NextResponse.json({ message: 'Error updating supplier' }, { status: 500 });
  }
}
