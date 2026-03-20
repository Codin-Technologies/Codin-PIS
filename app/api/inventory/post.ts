import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems } from '@/lib/db/schema';

export async function postInventory(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, sku, departmentId, qty, unit, icon, minQty } = body;

    if (!name || !sku || !departmentId) {
      return NextResponse.json({ message: 'name, sku, and departmentId are required' }, { status: 400 });
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

    return NextResponse.json({ data: item, message: 'Inventory item created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postInventory]', err);
    return NextResponse.json({ message: 'Error creating inventory item' }, { status: 500 });
  }
}
