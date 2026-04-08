import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requisitions } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { normalizeRequisitionStatus } from '@/lib/procurement/requisition-status';
import { AuthenticatedUser } from '@/lib/auth/utils';

export async function getRequisitions(req: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = user.organizationId;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const deptId = searchParams.get('departmentId') || searchParams.get('dept');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 20));

    if (!organizationId) {
      return NextResponse.json({ message: 'Organization context missing' }, { status: 400 });
    }

    const conditions = [eq(requisitions.organizationId, organizationId), isNull(requisitions.deletedAt)];
    if (status && status !== 'All') {
      const st = normalizeRequisitionStatus(status);
      if (st) conditions.push(eq(requisitions.status, st));
    }
    if (deptId) conditions.push(eq(requisitions.departmentId, deptId));

    const all = await db.query.requisitions.findMany({
      where: and(...conditions),
      with: {
        department: true,
        requestedBy: true,
        items: { with: { inventoryItem: true } },
      },
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });

    let filtered = all;
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      filtered = all.filter(
        (r) =>
          r.requisitionNumber.toLowerCase().includes(q) ||
          (r.reason?.toLowerCase().includes(q) ?? false) ||
          (r.requestedBy?.fullName?.toLowerCase().includes(q) ?? false),
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    const data = slice.map((r) => ({
      id: r.id,
      requisitionNumber: r.requisitionNumber,
      branchId: r.organizationId,
      organizationId: r.organizationId,
      requestedBy: r.requestedBy?.fullName ?? r.requestedById,
      requestedById: r.requestedById,
      departmentId: r.departmentId,
      dept: r.department?.name ?? '',
      subject: r.reason?.slice(0, 120) || r.requisitionNumber,
      value: Number(r.estimatedTotal ?? 0),
      date: r.createdAt?.toISOString?.() ?? String(r.createdAt),
      status: r.status,
      priority: r.priority,
      deliveryDate: r.deliveryDate,
      reason: r.reason,
      budgetId: r.budgetId,
      fiscalYear: r.fiscalYear,
      estimatedTotal: r.estimatedTotal,
      items: r.items?.map((li) => ({
        id: li.id,
        name: li.inventoryItem?.name ?? '',
        qty: li.qty,
        unit: li.inventoryItem?.unit ?? 'pcs',
        estimatedPrice: Number(li.estimatedUnitPrice ?? 0),
        inventoryItemId: li.inventoryItemId,
      })),
    }));

    return NextResponse.json(
      { data, total, page, pageSize, message: 'Requisitions fetched successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[getRequisitions]', err);
    return NextResponse.json({ message: 'Error fetching requisitions' }, { status: 500 });
  }
}
