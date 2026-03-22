import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function getProductionPlans() {
  try {
    const plans = await db.query.productionPlans.findMany({
      with: {
        ingredients: {
          with: {
            inventoryItem: true,
          },
        },
      },
      orderBy: (productionPlans, { desc }) => [desc(productionPlans.createdAt)],
    });

    // Flatten logic for the frontend: map ingredients to include item info at top level
    const formattedPlans = plans.map((plan) => ({
      ...plan,
      ingredients: plan.ingredients.map((ing) => ({
        id: ing.id,
        productionPlanId: ing.productionPlanId,
        inventoryItemId: ing.inventoryItemId,
        qty: ing.qty,
        name: ing.inventoryItem.name,
        unit: ing.inventoryItem.unit,
      })),
    }));

    return NextResponse.json({ data: formattedPlans, message: 'Production plans fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getProductionPlans]', err);
    return NextResponse.json({ message: 'Error fetching production plans' }, { status: 500 });
  }
}
