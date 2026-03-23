import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stockUsages } from '@/lib/db/schema';
import { eq, isNull, desc } from 'drizzle-orm';

export async function getStockUsages(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    const records = await db.query.stockUsages.findMany({
      where: organizationId
        ? eq(stockUsages.organizationId, organizationId)
        : isNull(stockUsages.deletedAt),
      with: {
        recordedBy: {
          columns: { id: true, fullName: true, email: true },
        },
        items: {
          with: {
            inventoryItem: {
              columns: { id: true, name: true, unit: true },
            },
          },
        },
      },
      orderBy: [desc(stockUsages.createdAt)],
    });

    const enriched = records.map((r) => ({
      id: r.id,
      date: r.date,
      reason: r.reason,
      notes: r.notes,
      organizationId: r.organizationId,
      createdAt: r.createdAt,
      recordedBy: r.recordedBy ?? null,
      itemsCount: r.items.length,
      items: r.items.map((i) => ({
        id: i.id,
        inventoryItemId: i.inventoryItemId,
        inventoryItemName: i.inventoryItem?.name ?? null,
        unit: i.inventoryItem?.unit ?? null,
        qtyUsed: parseFloat(i.qtyUsed as unknown as string),
      })),
    }));

    return NextResponse.json(
      { data: enriched, message: 'Stock usage records fetched successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[getStockUsages]', err);
    return NextResponse.json({ message: 'Error fetching stock usage records' }, { status: 500 });
  }
}
