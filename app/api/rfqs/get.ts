import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfqs, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';

export async function getRfqs(req: NextRequest, authUser: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId') || searchParams.get('branchId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 20));

    if (!organizationId) {
      return NextResponse.json({ message: 'organizationId or branchId is required' }, { status: 400 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser || dbUser.organizationId !== organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const conditions = [eq(rfqs.organizationId, organizationId), isNull(rfqs.deletedAt)];
    if (status?.trim()) conditions.push(eq(rfqs.status, status.trim().toLowerCase()));

    const rows = await db.query.rfqs.findMany({
      where: and(...conditions),
      with: {
        rfqSuppliers: true,
        createdBy: true,
      },
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });

    let filtered = rows;
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      filtered = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.rfqNumber.toLowerCase().includes(q) ||
          (r.category?.toLowerCase().includes(q) ?? false),
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    const data = slice.map((r) => ({
      id: r.id,
      branchId: r.organizationId,
      organizationId: r.organizationId,
      rfqNumber: r.rfqNumber,
      requisitionId: r.requisitionId,
      title: r.title,
      category: r.category ?? null,
      paymentTerms: r.paymentTerms ?? null,
      requiredDelivery: r.requiredDelivery ?? null,
      deadline: r.deadline ?? null,
      status: r.status,
      createdAt: r.createdAt?.toISOString?.() ?? String(r.createdAt),
      createdById: r.createdById,
      createdByName: r.createdBy?.fullName ?? null,
      responseCount: r.rfqSuppliers?.length ?? 0,
      supplierIds: r.rfqSuppliers?.map(rs => rs.supplierId) ?? [],
    }));

    return NextResponse.json(
      { data, total, page, pageSize, message: 'RFQs fetched successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[getRfqs]', err);
    return NextResponse.json({ message: 'Error fetching RFQs' }, { status: 500 });
  }
}
