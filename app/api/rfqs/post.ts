import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requisitions, rfqSuppliers, rfqs, suppliers, users } from '@/lib/db/schema';
import { and, eq, inArray, isNull, like, sql } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';

export async function postRfq(req: NextRequest, authUser: AuthenticatedUser) {
  try {
    const body = await req.json();
    const orgId = body.organizationId || body.branchId;
    const {
      requisitionId,
      title,
      category,
      paymentTerms,
      requiredDelivery,
      deadline,
      supplierIds,
      description,
      terms,
    } = body;

    if (!orgId || !requisitionId || !title?.trim()) {
      return NextResponse.json(
        { message: 'branchId (or organizationId), requisitionId, and title are required' },
        { status: 400 },
      );
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser || dbUser.organizationId !== orgId) {
      return NextResponse.json({ message: 'User does not belong to this organization' }, { status: 403 });
    }

    const reqRow = await db.query.requisitions.findFirst({
      where: and(eq(requisitions.id, requisitionId), isNull(requisitions.deletedAt)),
    });
    if (!reqRow || reqRow.organizationId !== orgId) {
      return NextResponse.json({ message: 'Requisition not found for this organization' }, { status: 400 });
    }
    if (reqRow.status !== 'approved') {
      return NextResponse.json(
        { message: 'Only approved requisitions can be linked to an RFQ' },
        { status: 400 },
      );
    }

    const rawIds = Array.isArray(supplierIds)
      ? supplierIds.filter((x: unknown): x is string => typeof x === 'string')
      : [];
    const ids: string[] = [];
    const seen = new Set<string>();
    for (const sid of rawIds) {
      if (!seen.has(sid)) {
        seen.add(sid);
        ids.push(sid);
      }
    }

    if (ids.length > 0) {
      const supRows = await db.query.suppliers.findMany({
        where: and(inArray(suppliers.id, ids), isNull(suppliers.deletedAt)),
      });
      if (supRows.length !== ids.length) {
        return NextResponse.json({ message: 'One or more suppliers not found' }, { status: 400 });
      }
      for (const s of supRows) {
        if (s.organizationId !== orgId) {
          return NextResponse.json({ message: 'Supplier is not in this organization' }, { status: 400 });
        }
      }
    }

    const year = new Date().getFullYear();
    const prefix = `RFQ-${year}-`;
    const [countRow] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(rfqs)
      .where(and(eq(rfqs.organizationId, orgId), like(rfqs.rfqNumber, `${prefix}%`)));
    const next = (countRow?.c ?? 0) + 1;
    const rfqNumber = `${prefix}${String(next).padStart(4, '0')}`;

    const result = await db.transaction(async (tx) => {
      const [header] = await tx
        .insert(rfqs)
        .values({
          rfqNumber,
          organizationId: orgId,
          createdById: authUser.id,
          requisitionId,
          title: title.trim(),
          category: category?.trim() || null,
          paymentTerms: paymentTerms?.trim() || null,
          requiredDelivery: requiredDelivery?.trim() || null,
          deadline: deadline?.trim() || null,
          description: description?.trim() || null,
          terms: terms?.trim() || null,
          status: 'draft',
        })
        .returning();

      if (!header) throw new Error('insert failed');

      if (ids.length > 0) {
        await tx.insert(rfqSuppliers).values(
          ids.map((supplierId) => ({
            rfqId: header.id,
            supplierId,
          })),
        );
      }

      return header;
    });

    const full = await db.query.rfqs.findFirst({
      where: eq(rfqs.id, result.id),
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
      return NextResponse.json({ message: 'RFQ created but could not be loaded' }, { status: 500 });
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
          description: full.description,
          terms: full.terms,
          status: full.status,
          createdAt: full.createdAt?.toISOString?.() ?? String(full.createdAt),
          createdById: full.createdById,
          createdByName: full.createdBy?.fullName ?? null,
          responseCount: full.rfqSuppliers?.length ?? 0,
          supplierIds: (full.rfqSuppliers ?? []).map((rs) => rs.supplierId),
          suppliers: (full.rfqSuppliers ?? [])
            .map((rs) => rs.supplier)
            .filter(Boolean)
            .map((s) => ({
              id: s!.id,
              name: s!.name,
              category: s!.category,
              email: s!.email,
              phone: s!.phone,
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
        message: 'RFQ created successfully',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[postRfq]', err);
    return NextResponse.json({ message: 'Error creating RFQ' }, { status: 500 });
  }
}
