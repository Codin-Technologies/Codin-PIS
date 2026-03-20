import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function computeStatus(qty: number, minQty: number): 'Good' | 'Low' | 'Critical' {
  if (qty <= minQty) return 'Critical';
  if (qty <= minQty * 2) return 'Low';
  return 'Good';
}

export async function getInventory(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');

    const items = await db.query.inventoryItems.findMany({
      where: departmentId ? eq(inventoryItems.departmentId, departmentId) : undefined,
      with: { department: true },
    });

    const enriched = items.map(({ minQty, qty, ...rest }) => ({
      ...rest,
      qty,
      minQty,
      status: computeStatus(qty, minQty),
    }));

    return NextResponse.json({ data: enriched, message: 'Inventory fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getInventory]', err);
    return NextResponse.json({ message: 'Error fetching inventory' }, { status: 500 });
  }
}
