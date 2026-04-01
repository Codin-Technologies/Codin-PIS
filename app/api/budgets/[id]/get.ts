import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { budgets } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { budgetUtilizationTotals } from '@/lib/procurement/budget-utilization';

export async function getBudgetById(req: NextRequest, id: string) {
  try {
    const row = await db.query.budgets.findFirst({
      where: and(eq(budgets.id, id), isNull(budgets.deletedAt)),
      with: { department: true },
    });

    if (!row) {
      return NextResponse.json({ message: 'Budget not found' }, { status: 404 });
    }

    const allocated = Number(row.allocatedAmount);
    const { spent, committed } = await budgetUtilizationTotals(row.id);
    const used = spent + committed;
    const remaining = allocated - used;
    let health: 'on_track' | 'warning' | 'critical' = 'on_track';
    const pct = allocated > 0 ? used / allocated : 0;
    if (pct >= 1) health = 'critical';
    else if (pct >= 0.8) health = 'warning';

    return NextResponse.json(
      {
        data: {
          id: row.id,
          name: row.name,
          departmentId: row.departmentId,
          departmentName: row.department?.name ?? null,
          organizationId: row.organizationId,
          fiscalYear: row.fiscalYear,
          allocatedAmount: row.allocatedAmount,
          notes: row.notes,
          createdAt: row.createdAt,
          spent,
          committed,
          remaining,
          health,
        },
        message: 'Budget fetched successfully',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[getBudgetById]', err);
    return NextResponse.json({ message: 'Error fetching budget' }, { status: 500 });
  }
}
