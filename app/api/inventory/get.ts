import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems, departments } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

function computeStatus(qty: number, minQty: number): 'Good' | 'Low' | 'Critical' {
  if (qty <= minQty) return 'Critical';
  if (qty <= minQty * 2) return 'Low';
  return 'Good';
}

export async function getInventory(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const organizationId = searchParams.get('organizationId') || searchParams.get('branchId');

    let items: (typeof inventoryItems.$inferSelect & { department: typeof departments.$inferSelect | null })[];
    if (organizationId) {
      // Get all departments for the organization, then get inventory items
      const orgDepartments = await db.query.departments.findMany({
        where: eq(departments.organizationId, organizationId),
      });

      const departmentIds = orgDepartments.map(dept => dept.id);

      if (departmentIds.length > 0) {
        items = await db.query.inventoryItems.findMany({
          where: inArray(inventoryItems.departmentId, departmentIds),
          with: { department: true },
        });
      } else {
        items = [];
      }
    } else {
      // Original logic for department filtering
      items = await db.query.inventoryItems.findMany({
        where: departmentId ? eq(inventoryItems.departmentId, departmentId) : undefined,
        with: { department: true },
      });
    }

    const enriched = items.map(({ minQty, qty, department, ...rest }) => ({
      ...rest,
      qty,
      minQty,
      status: computeStatus(qty, minQty),
      dept: department?.name || 'Unknown',
    }));

    return NextResponse.json({ data: enriched, message: 'Inventory fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getInventory]', err);
    return NextResponse.json({ message: 'Error fetching inventory' }, { status: 500 });
  }
}
