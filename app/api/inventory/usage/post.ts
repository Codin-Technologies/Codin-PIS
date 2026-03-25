import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stockUsages, stockUsageItems, inventoryItems } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

interface UsageLineItem {
  inventoryItemId: string;
  qtyUsed: number;
}

export async function postStockUsage(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, reason, notes, organizationId, recordedById, items } = body as {
      date: string;
      reason: string;
      notes?: string;
      organizationId: string;
      recordedById?: string;
      items: UsageLineItem[];
    };

    // ── Validation ──────────────────────────────────────────────────────────
    if (!date || !reason || !organizationId) {
      return NextResponse.json(
        { message: 'date, reason, and organizationId are required' },
        { status: 400 }
      );
    }

    const validReasons = ['Waste', 'Consumption', 'Theft', 'Other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { message: `reason must be one of: ${validReasons.join(', ')}` },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'At least one item is required' },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.inventoryItemId) {
        return NextResponse.json({ message: 'Each item must have an inventoryItemId' }, { status: 400 });
      }
      if (typeof item.qtyUsed !== 'number' || item.qtyUsed <= 0) {
        return NextResponse.json(
          { message: `qtyUsed must be a positive number (got ${item.qtyUsed})` },
          { status: 400 }
        );
      }
    }

    // ── Pre-flight: check stock levels prevent negative inventory ────────────
    const inventoryIds = items.map((i) => i.inventoryItemId);

    const stockRows = await db.query.inventoryItems.findMany({
      where: inArray(inventoryItems.id, inventoryIds),
      columns: {
        id: true,
        name: true,
        qty: true,
      },
    });

    const stockMap = new Map(stockRows.map((r) => [r.id, r]));

    for (const item of items) {
      const stock = stockMap.get(item.inventoryItemId);
      if (!stock) {
        return NextResponse.json(
          { message: `Inventory item ${item.inventoryItemId} not found` },
          { status: 404 }
        );
      }
      if (stock.qty - item.qtyUsed < 0) {
        return NextResponse.json(
          {
            message: `Insufficient stock for "${stock.name}". Available: ${stock.qty}, Requested: ${item.qtyUsed}`,
          },
          { status: 422 }
        );
      }
    }

    // ── Atomic transaction: insert usage + deduct inventory ─────────────────
    const result = await db.transaction(async (tx) => {
      // 1. Insert usage header
      const [usage] = await tx
        .insert(stockUsages)
        .values({
          date,
          reason,
          notes: notes ?? null,
          organizationId,
          recordedById: recordedById ?? null,
        })
        .returning();

      // 2. Insert line items
      const lineValues = items.map((item) => ({
        stockUsageId: usage.id,
        inventoryItemId: item.inventoryItemId,
        qtyUsed: String(item.qtyUsed),
      }));

      const insertedLines = await tx
        .insert(stockUsageItems)
        .values(lineValues)
        .returning();

      // 3. Deduct qty from inventory_items — one UPDATE per item
      for (const item of items) {
        await tx
          .update(inventoryItems)
          .set({ qty: sql`${inventoryItems.qty} - ${item.qtyUsed}` })
          .where(eq(inventoryItems.id, item.inventoryItemId));
      }

      return { usage, lines: insertedLines };
    });

    return NextResponse.json(
      {
        data: {
          ...result.usage,
          items: result.lines.map((l) => ({
            ...l,
            qtyUsed: parseFloat(l.qtyUsed as unknown as string),
          })),
        },
        message: 'Stock usage recorded and inventory updated successfully',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[postStockUsage]', err);
    const message = err instanceof Error ? err.message : 'Error recording stock usage';
    return NextResponse.json({ message }, { status: 500 });
  }
}
