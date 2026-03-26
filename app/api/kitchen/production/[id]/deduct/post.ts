import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productionPlans, productionPlanIngredients, inventoryItems } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function deductProductionPlanStock(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if plan exists and isn't already deducted
    const plan = await db.query.productionPlans.findFirst({
      where: eq(productionPlans.id, id),
    });

    if (!plan) return NextResponse.json({ message: 'Production plan not found' }, { status: 404 });
    if (plan.deductedAt) return NextResponse.json({ message: 'Stock already deducted for this plan' }, { status: 400 });

    const result = await db.transaction(async (tx) => {
      // 1. Fetch all ingredients required
      const ingredients = await tx.query.productionPlanIngredients.findMany({
        where: eq(productionPlanIngredients.productionPlanId, id),
      });

      // 2. Deduct each ingredient's quantity from the inventory table atomically
      for (const ing of ingredients) {
        await tx
          .update(inventoryItems)
          .set({
            qty: sql`GREATEST(0, ${inventoryItems.qty} - ${ing.qty})`, // Floor at zero
            updatedAt: new Date(),
          })
          .where(eq(inventoryItems.id, ing.inventoryItemId));
      }

      // 3. Mark the plan as completed and deducted
      const [updatedPlan] = await tx
        .update(productionPlans)
        .set({
          status: 'Completed',
          deductedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(productionPlans.id, id))
        .returning();

      return updatedPlan;
    });

    return NextResponse.json({ data: result, message: 'Stock deducted successfully and plan marked Completed' });
  } catch (err) {
    console.error('[deductProductionPlanStock]', err);
    return NextResponse.json({ message: 'Error deducting stock' }, { status: 500 });
  }
}
