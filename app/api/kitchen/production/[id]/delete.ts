import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productionPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function deleteProductionPlan(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [removed] = await db.delete(productionPlans).where(eq(productionPlans.id, id)).returning({ id: productionPlans.id });

    if (!removed) {
      return NextResponse.json({ message: 'Production plan not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Production plan deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('[deleteProductionPlan]', err);
    return NextResponse.json({ message: 'Error deleting production plan' }, { status: 500 });
  }
}
