import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';
import { supplierToDto } from '@/lib/procurement/supplier-dto';

export async function postSupplier(req: NextRequest, authUser: AuthenticatedUser) {
  try {
    const body = await req.json();
    const orgId = body.organizationId || body.branchId;
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
    } = body;

    if (!orgId || !name?.trim() || !category?.trim()) {
      return NextResponse.json(
        { message: 'organizationId (or branchId), name, and category are required' },
        { status: 400 },
      );
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser || dbUser.organizationId !== orgId) {
      return NextResponse.json({ message: 'User does not belong to this organization' }, { status: 403 });
    }

    const [row] = await db
      .insert(suppliers)
      .values({
        organizationId: orgId,
        name: name.trim(),
        category: category.trim(),
        contactPerson: contactPerson?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        vatNumber: vatNumber?.trim() || null,
        paymentTerms: paymentTerms?.trim() || null,
        streetAddress: streetAddress?.trim() || null,
      })
      .returning();

    if (!row) {
      return NextResponse.json({ message: 'Failed to create supplier' }, { status: 500 });
    }

    return NextResponse.json(
      { data: supplierToDto(row), message: 'Supplier created successfully' },
      { status: 201 },
    );
  } catch (err) {
    console.error('[postSupplier]', err);
    return NextResponse.json({ message: 'Error creating supplier' }, { status: 500 });
  }
}
