import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requisitions } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { normalizeRequisitionStatus } from '@/lib/procurement/requisition-status';

export async function patchRequisitionStatus(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const raw = body.status as string;
    if (!raw) {
      return NextResponse.json({ message: 'status is required' }, { status: 400 });
    }

    const status = normalizeRequisitionStatus(raw);
    if (!status) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const existing = await db.query.requisitions.findFirst({
      where: and(eq(requisitions.id, id), isNull(requisitions.deletedAt)),
    });
    if (!existing) {
      return NextResponse.json({ message: 'Requisition not found' }, { status: 404 });
    }

    await db
      .update(requisitions)
      .set({ status, updatedAt: new Date() })
      .where(eq(requisitions.id, id))
      .returning();

    const full = await db.query.requisitions.findFirst({
      where: eq(requisitions.id, id),
      with: {
        department: true,
        requestedBy: true,
        items: { with: { inventoryItem: true } },
      },
    });

    return NextResponse.json(
      {
        data: {
          id: full!.id,
          requisitionNumber: full!.requisitionNumber,
          branchId: full!.organizationId,
          organizationId: full!.organizationId,
          requestedBy: full!.requestedBy?.fullName ?? full!.requestedById,
          requestedById: full!.requestedById,
          departmentId: full!.departmentId,
          dept: full!.department?.name ?? '',
          subject: full!.reason?.slice(0, 120) || full!.requisitionNumber,
          value: Number(full!.estimatedTotal ?? 0),
          date: full!.createdAt?.toISOString?.() ?? String(full!.createdAt),
          status: full!.status,
          priority: full!.priority,
          deliveryDate: full!.deliveryDate,
          reason: full!.reason,
          budgetId: full!.budgetId,
          fiscalYear: full!.fiscalYear,
          estimatedTotal: full!.estimatedTotal,
          items: full!.items?.map((li) => ({
            id: li.id,
            name: li.inventoryItem?.name ?? '',
            qty: li.qty,
            unit: li.inventoryItem?.unit ?? 'pcs',
            estimatedPrice: Number(li.estimatedUnitPrice ?? 0),
            inventoryItemId: li.inventoryItemId,
          })),
        },
        message: 'Status updated successfully',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[patchRequisitionStatus]', err);
    return NextResponse.json({ message: 'Error updating status' }, { status: 500 });
  }
}
