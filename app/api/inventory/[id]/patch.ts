import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function patchInventoryQty(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { delta } = await request.json();

    if (typeof delta !== 'number') {
      return NextResponse.json({ message: 'delta must be a number' }, { status: 400 });
    }

    const [updated] = await db
      .update(inventoryItems)
      .set({
        qty: sql`GREATEST(0, ${inventoryItems.qty} + ${delta})`,
        updatedAt: new Date(),
      })
      .where(eq(inventoryItems.id, id))
      .returning();

    if (!updated) return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    return NextResponse.json({ data: updated, message: 'Quantity updated successfully' });
  } catch (err) {
    console.error('[patchInventoryQty]', err);
    return NextResponse.json({ message: 'Error adjusting quantity' }, { status: 500 });
  }
}
