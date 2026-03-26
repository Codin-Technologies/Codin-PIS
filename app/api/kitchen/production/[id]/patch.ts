import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productionPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function patchProductionPlan(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: 'status is required' }, { status: 400 });
    }

    const [updated] = await db
      .update(productionPlans)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(productionPlans.id, id))
      .returning();

    if (!updated) return NextResponse.json({ message: 'Production plan not found' }, { status: 404 });
    return NextResponse.json({ data: updated, message: 'Status updated successfully' });
  } catch (err) {
    console.error('[patchProductionPlan]', err);
    return NextResponse.json({ message: 'Error updating production plan' }, { status: 500 });
  }
}
