import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { supplierToDto } from '@/lib/procurement/supplier-dto';
import type { AuthenticatedUser } from '@/lib/auth/utils';

export async function getSuppliers(req: NextRequest, authUser: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = authUser.organizationId;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 20));

    if (!organizationId) {
      return NextResponse.json({ message: 'Organization context missing' }, { status: 400 });
    }

    const conditions = [eq(suppliers.organizationId, organizationId), isNull(suppliers.deletedAt)];
    if (category?.trim()) conditions.push(eq(suppliers.category, category.trim()));
    if (status?.trim()) conditions.push(eq(suppliers.status, status.trim()));

    const rows = await db.query.suppliers.findMany({
      where: and(...conditions),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    });

    let filtered = rows;
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      filtered = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.contactPerson?.toLowerCase().includes(q) ?? false) ||
          (s.email?.toLowerCase().includes(q) ?? false),
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const slice = filtered.slice(start, start + pageSize);
    const data = slice.map(supplierToDto);

    return NextResponse.json(
      { data, total, page, pageSize, message: 'Suppliers fetched successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[getSuppliers]', err);
    return NextResponse.json({ message: 'Error fetching suppliers' }, { status: 500 });
  }
}
