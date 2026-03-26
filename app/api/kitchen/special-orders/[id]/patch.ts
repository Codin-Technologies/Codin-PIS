import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { specialOrders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function patchSpecialOrder(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: 'status is required' }, { status: 400 });
    }

    const [updated] = await db
      .update(specialOrders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(specialOrders.id, id))
      .returning();

    if (!updated) return NextResponse.json({ message: 'Special order not found' }, { status: 404 });
    return NextResponse.json({ data: updated, message: 'Special order updated successfully' });
  } catch (err) {
    console.error('[patchSpecialOrder]', err);
    return NextResponse.json({ message: 'Error updating special order' }, { status: 500 });
  }
}
