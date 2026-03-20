import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function putInventoryItem(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, sku, departmentId, qty, unit, icon, minQty } = body;

    const [updated] = await db
      .update(inventoryItems)
      .set({
        ...(name && { name }),
        ...(sku && { sku }),
        ...(departmentId && { departmentId }),
        ...(qty !== undefined && { qty }),
        ...(unit && { unit }),
        ...(icon && { icon }),
        ...(minQty !== undefined && { minQty }),
        updatedAt: new Date(),
      })
      .where(eq(inventoryItems.id, id))
      .returning();

    if (!updated) return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    return NextResponse.json({ data: updated, message: 'Item updated successfully' });
  } catch (err) {
    console.error('[putInventory]', err);
    return NextResponse.json({ message: 'Error updating item' }, { status: 500 });
  }
}
