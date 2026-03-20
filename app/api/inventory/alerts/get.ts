import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function getInventoryAlerts() {
  try {
    const alerts = await db.query.inventoryItems.findMany({
      where: sql`${inventoryItems.qty} <= ${inventoryItems.minQty} * 2`,
      with: { department: true },
    });

    const enriched = alerts
      .map(({ qty, minQty, ...rest }) => ({
        ...rest,
        qty,
        minQty,
        status: qty <= minQty ? 'Critical' : 'Low',
      }))
      .sort((a, b) => (a.status === 'Critical' && b.status !== 'Critical' ? -1 : 1));

    return NextResponse.json({ data: enriched, message: 'Alerts fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getInventoryAlerts]', err);
    return NextResponse.json({ message: 'Error fetching alerts' }, { status: 500 });
  }
}
