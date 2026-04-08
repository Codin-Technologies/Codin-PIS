import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems, departments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedUser } from '@/lib/auth/utils';

export async function postInventory(req: NextRequest, user: AuthenticatedUser) {
  try {
    const body = await req.json();
    const { name, sku, departmentId, qty, unit, icon, minQty } = body;

    if (!name || !sku || !departmentId) {
      return NextResponse.json({ message: 'name, sku, and departmentId are required' }, { status: 400 });
    }

    // Security Check: Verify department belongs to user's organization
    const dept = await db.query.departments.findFirst({
      where: and(
        eq(departments.id, departmentId),
        eq(departments.organizationId, user.organizationId ?? '')
      ),
    });

    if (!dept) {
      return NextResponse.json({ message: 'Invalid department or access denied' }, { status: 403 });
    }

    const [item] = await db
      .insert(inventoryItems)
      .values({
        name,
        sku,
        departmentId,
        qty: qty ?? 0,
        unit: unit ?? 'pcs',
        icon: icon ?? '📦',
        minQty: minQty ?? 10,
      })
      .returning();

    // Fetch the item with department details
    const itemWithDept = await db.query.inventoryItems.findFirst({
      where: (table, { eq }) => eq(table.id, item.id),
      with: { department: true },
    });

    const response = itemWithDept ? {
      ...itemWithDept,
      dept: itemWithDept.department?.name || 'Unknown',
      status: 'Good' as const,
    } : item;

    return NextResponse.json({ data: response, message: 'Inventory item created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postInventory]', err);
    return NextResponse.json({ message: 'Error creating inventory item' }, { status: 500 });
  }
}
