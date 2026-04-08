import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems, departments } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { AuthenticatedUser } from '@/lib/auth/utils';

function computeStatus(qty: number, minQty: number): 'Good' | 'Low' | 'Critical' {
  if (qty <= minQty) return 'Critical';
  if (qty <= minQty * 2) return 'Low';
  return 'Good';
}

export async function getInventory(req: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const organizationId = user.organizationId;

    if (!organizationId) {
      return NextResponse.json({ message: 'Organization context missing' }, { status: 400 });
    }

    let items: (typeof inventoryItems.$inferSelect & { department: typeof departments.$inferSelect | null })[];
    
    // Get all departments for the organization to ensure isolation
    const orgDepartments = await db.query.departments.findMany({
      where: eq(departments.organizationId, organizationId),
    });

    const departmentIds = orgDepartments.map(dept => dept.id);

    if (departmentIds.length > 0) {
      // If a specific departmentId is requested, ensure it belongs to the user's organization
      const targetDeptIds = departmentId 
        ? departmentIds.filter(id => id === departmentId)
        : departmentIds;

      if (targetDeptIds.length > 0) {
        items = await db.query.inventoryItems.findMany({
          where: inArray(inventoryItems.departmentId, targetDeptIds),
          with: { department: true },
        });
      } else {
        items = [];
      }
    } else {
      items = [];
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
