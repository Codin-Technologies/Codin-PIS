import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfqs, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';

export async function getRfqById(req: NextRequest, id: string, authUser: AuthenticatedUser) {
  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const full = await db.query.rfqs.findFirst({
      where: and(eq(rfqs.id, id), isNull(rfqs.deletedAt)),
      with: {
        rfqSuppliers: { with: { supplier: true } },
        requisition: {
          with: {
            items: { with: { inventoryItem: true } },
          },
        },
        createdBy: true,
      },
    });

    if (!full) {
      return NextResponse.json({ message: 'RFQ not found' }, { status: 404 });
    }

    if (full.organizationId !== dbUser.organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      {
        data: {
          id: full.id,
          branchId: full.organizationId,
          organizationId: full.organizationId,
          rfqNumber: full.rfqNumber,
          requisitionId: full.requisitionId,
          title: full.title,
          category: full.category,
          paymentTerms: full.paymentTerms,
          requiredDelivery: full.requiredDelivery,
          deadline: full.deadline,
          status: full.status,
          createdAt: full.createdAt?.toISOString?.() ?? String(full.createdAt),
          createdById: full.createdById,
          createdByName: full.createdBy?.fullName ?? null,
          responseCount: full.rfqSuppliers?.length ?? 0,
          suppliers: (full.rfqSuppliers ?? [])
            .map((rs) => rs.supplier)
            .filter(Boolean)
            .map((s) => ({
              id: s!.id,
              name: s!.name,
              category: s!.category,
              email: s!.email,
              phone: s!.phone,
              website: s!.website,
            })),
          items: (full.requisition?.items ?? []).map((li) => ({
            id: li.id,
            name: li.inventoryItem?.name ?? '',
            qty: li.qty,
            unit: li.inventoryItem?.unit ?? 'pcs',
            estimatedPrice: Number(li.estimatedUnitPrice ?? 0),
            inventoryItemId: li.inventoryItemId,
          })),
        },
        message: 'RFQ fetched successfully',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[getRfqById]', err);
    return NextResponse.json({ message: 'Error fetching RFQ' }, { status: 500 });
  }
}
