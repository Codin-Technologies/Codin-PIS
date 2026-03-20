import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function deleteInventoryItem(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .returning();

    if (!deleted) return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('[deleteInventory]', err);
    return NextResponse.json({ message: 'Error deleting item' }, { status: 500 });
  }
}
