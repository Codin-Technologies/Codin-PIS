import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stockUsages } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function getStockUsageById(req: NextRequest, id: string) {
  try {
    const record = await db.query.stockUsages.findFirst({
      where: and(eq(stockUsages.id, id), isNull(stockUsages.deletedAt)),
      with: {
        recordedBy: {
          columns: { id: true, fullName: true, email: true },
        },
        items: {
          with: {
            inventoryItem: {
              columns: { id: true, name: true, unit: true, qty: true },
            },
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ message: 'Stock usage record not found' }, { status: 404 });
    }

    const response = {
      id: record.id,
      date: record.date,
      reason: record.reason,
      notes: record.notes,
      organizationId: record.organizationId,
      createdAt: record.createdAt,
      recordedBy: record.recordedBy ?? null,
      items: record.items.map((i) => ({
        id: i.id,
        inventoryItemId: i.inventoryItemId,
        inventoryItemName: i.inventoryItem?.name ?? null,
        unit: i.inventoryItem?.unit ?? null,
        currentStock: i.inventoryItem?.qty ?? null,
        qtyUsed: parseFloat(i.qtyUsed as unknown as string),
      })),
    };

    return NextResponse.json({ data: response, message: 'Record fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getStockUsageById]', err);
    return NextResponse.json({ message: 'Error fetching stock usage record' }, { status: 500 });
  }
}
