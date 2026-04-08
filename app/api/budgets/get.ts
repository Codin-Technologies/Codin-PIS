import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { budgets } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { budgetUtilizationTotals } from '@/lib/procurement/budget-utilization';
import { AuthenticatedUser } from '@/lib/auth/utils';

export async function getBudgets(req: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = user.organizationId;
    const departmentId = searchParams.get('departmentId');
    const fiscalYear = searchParams.get('fiscalYear');

    if (!organizationId) {
      return NextResponse.json({ message: 'Organization context missing' }, { status: 400 });
    }

    const conditions = [
      eq(budgets.organizationId, organizationId),
      isNull(budgets.deletedAt),
    ];
    if (departmentId) conditions.push(eq(budgets.departmentId, departmentId));
    if (fiscalYear) conditions.push(eq(budgets.fiscalYear, fiscalYear));

    const rows = await db.query.budgets.findMany({
      where: and(...conditions),
      with: { department: true },
      orderBy: (b, { desc }) => [desc(b.createdAt)],
    });

    const data = await Promise.all(
      rows.map(async (b) => {
        const allocated = Number(b.allocatedAmount);
        const { spent, committed } = await budgetUtilizationTotals(b.id);
        const used = spent + committed;
        const remaining = allocated - used;
        let health: 'on_track' | 'warning' | 'critical' = 'on_track';
        const pct = allocated > 0 ? used / allocated : 0;
        if (pct >= 1) health = 'critical';
        else if (pct >= 0.8) health = 'warning';

        return {
          id: b.id,
          name: b.name,
          departmentId: b.departmentId,
          departmentName: b.department?.name ?? null,
          organizationId: b.organizationId,
          fiscalYear: b.fiscalYear,
          allocatedAmount: b.allocatedAmount,
          notes: b.notes,
          createdAt: b.createdAt,
          spent,
          committed,
          remaining,
          health,
        };
      }),
    );

    return NextResponse.json({ data, message: 'Budgets fetched successfully' }, { status: 200 });
  } catch (err) {
    console.error('[getBudgets]', err);
    return NextResponse.json({ message: 'Error fetching budgets' }, { status: 500 });
  }
}
