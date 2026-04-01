import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  budgets,
  departments,
  inventoryItems,
  requisitionItems,
  requisitions,
  users,
} from '@/lib/db/schema';
import { and, eq, inArray, isNull, like, sql } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';

type LineInput = {
  inventoryItemId: string;
  qty: number;
  estimatedUnitPrice?: number;
};

export async function postRequisition(req: NextRequest, authUser: AuthenticatedUser) {
  try {
    const body = await req.json();
    const {
      organizationId,
      branchId,
      departmentId,
      dept,
      budgetId,
      fiscalYear,
      priority,
      deliveryDate,
      reason,
      items,
    } = body;

    const orgId = organizationId || branchId;
    const deptId = departmentId || dept;

    if (!orgId || !deptId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'organizationId (or branchId), departmentId, and items[] are required' },
        { status: 400 },
      );
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser || dbUser.organizationId !== orgId) {
      return NextResponse.json({ message: 'User does not belong to this organization' }, { status: 403 });
    }

    const requesterId = authUser.id;

    const deptRow = await db.query.departments.findFirst({
      where: and(eq(departments.id, deptId), eq(departments.organizationId, orgId)),
    });
    if (!deptRow) {
      return NextResponse.json({ message: 'Department not found for this organization' }, { status: 400 });
    }

    let budgetFy: string | null = fiscalYear ? String(fiscalYear) : null;
    if (budgetId) {
      const b = await db.query.budgets.findFirst({
        where: and(eq(budgets.id, budgetId), isNull(budgets.deletedAt)),
      });
      if (!b || b.organizationId !== orgId) {
        return NextResponse.json({ message: 'Budget not found' }, { status: 400 });
      }
      budgetFy = b.fiscalYear;
    }

    const lines: LineInput[] = items.map((it: LineInput & { name?: string }) => ({
      inventoryItemId: it.inventoryItemId,
      qty: Number(it.qty),
      estimatedUnitPrice: it.estimatedUnitPrice != null ? Number(it.estimatedUnitPrice) : undefined,
    }));

    for (const line of lines) {
      if (!line.inventoryItemId || !Number.isFinite(line.qty) || line.qty <= 0) {
        return NextResponse.json({ message: 'Each item needs inventoryItemId and positive qty' }, { status: 400 });
      }
    }

    const invIds = lines.map((l) => l.inventoryItemId);
    const invRows = await db.query.inventoryItems.findMany({
      where: inArray(inventoryItems.id, invIds),
      with: { department: true },
    });

    if (invRows.length !== lines.length) {
      return NextResponse.json({ message: 'One or more inventory items not found' }, { status: 400 });
    }

    for (const inv of invRows) {
      if (inv.department?.organizationId !== orgId) {
        return NextResponse.json(
          { message: 'Inventory item is not in this organization' },
          { status: 400 },
        );
      }
    }

    let estimatedTotal = 0;
    const pricedLines = lines.map((line) => {
      const price = line.estimatedUnitPrice ?? 0;
      const lineTotal = line.qty * price;
      estimatedTotal += lineTotal;
      return { ...line, unitPrice: price };
    });

    const year = new Date().getFullYear();
    const prefix = `REQ-${year}-`;
    const [countRow] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(requisitions)
      .where(and(eq(requisitions.organizationId, orgId), like(requisitions.requisitionNumber, `${prefix}%`)));
    const next = (countRow?.c ?? 0) + 1;
    const requisitionNumber = `${prefix}${String(next).padStart(4, '0')}`;

    const result = await db.transaction(async (tx) => {
      const [header] = await tx
        .insert(requisitions)
        .values({
          requisitionNumber,
          requestedById: requesterId,
          departmentId: deptId,
          organizationId: orgId,
          budgetId: budgetId ?? null,
          fiscalYear: budgetFy,
          priority: priority ?? 'Normal',
          deliveryDate: deliveryDate ?? null,
          reason: reason ?? null,
          status: 'pending',
          estimatedTotal: String(estimatedTotal),
        })
        .returning();

      if (!header) throw new Error('insert failed');

      await tx.insert(requisitionItems).values(
        pricedLines.map((line) => ({
          requisitionId: header.id,
          inventoryItemId: line.inventoryItemId,
          qty: line.qty,
          estimatedUnitPrice: String(line.unitPrice),
        })),
      );

      return header;
    });

    const full = await db.query.requisitions.findFirst({
      where: eq(requisitions.id, result.id),
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
        message: 'Requisition created successfully',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[postRequisition]', err);
    return NextResponse.json({ message: 'Error creating requisition' }, { status: 500 });
  }
}
