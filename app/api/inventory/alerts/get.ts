import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems, departments } from '@/lib/db/schema';
import { sql, eq, and } from 'drizzle-orm';
import { AuthenticatedUser } from '@/lib/auth/utils';

export async function getInventoryAlerts(user: AuthenticatedUser) {
  try {
    const alerts = await db.select({
      id: inventoryItems.id,
      name: inventoryItems.name,
      sku: inventoryItems.sku,
      departmentId: inventoryItems.departmentId,
      qty: inventoryItems.qty,
      unit: inventoryItems.unit,
      icon: inventoryItems.icon,
      minQty: inventoryItems.minQty,
      description: inventoryItems.description,
      createdAt: inventoryItems.createdAt,
      updatedAt: inventoryItems.updatedAt,
      department: departments,
    })
    .from(inventoryItems)
    .innerJoin(departments, eq(inventoryItems.departmentId, departments.id))
    .where(and(
      sql`${inventoryItems.qty} <= ${inventoryItems.minQty} * 2`,
      eq(departments.organizationId, user.organizationId ?? '')
    ));

    const enriched = alerts
      .map(({ qty, minQty, department, ...rest }) => ({
        ...rest,
        qty,
        minQty,
        status: qty <= minQty ? 'Critical' : 'Low',
        dept: department?.name || 'Unknown',
      }))
      .sort((a, b) => (a.status === 'Critical' && b.status !== 'Critical' ? -1 : 1));

    return NextResponse.json({ data: enriched, message: 'Alerts fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getInventoryAlerts]', err);
    return NextResponse.json({ message: 'Error fetching alerts' }, { status: 500 });
  }
}
