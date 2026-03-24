import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productionPlans, productionPlanIngredients } from '@/lib/db/schema';

export async function postProductionPlan(req: NextRequest) {
  try {
    const body = await req.json();
    const { dishName, targetServings, estimatedStartTime, ingredients } = body;

    if (!dishName || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ message: 'dishName and a non-empty ingredients array are required' }, { status: 400 });
    }

    // Run within a transaction so we don't end up with an orphaned plan without ingredients
    const result = await db.transaction(async (tx) => {
      // 1. Create the production plan
      const [newPlan] = await tx
        .insert(productionPlans)
        .values({
          dishName,
          targetServings: targetServings ?? 1,
          estimatedStartTime,
          status: 'Planned',
        })
        .returning();

      // 2. Insert ingredients
      const planIngredients = ingredients.map((ing: any) => ({
        productionPlanId: newPlan.id,
        inventoryItemId: ing.inventoryItemId,
        qty: ing.qty,
      }));

      await tx.insert(productionPlanIngredients).values(planIngredients);

      return newPlan;
    });

    return NextResponse.json({ data: result, message: 'Production plan created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postProductionPlan]', err);
    return NextResponse.json({ message: 'Error creating production plan' }, { status: 500 });
  }
}
