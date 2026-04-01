import { db } from '@/lib/db';
import { requisitions } from '@/lib/db/schema';
import { and, eq, inArray, isNull, sum } from 'drizzle-orm';

const SPENT_STATUSES = ['approved', 'ordered', 'delivered'] as const;
const COMMITTED_STATUSES = ['pending', 'in_review'] as const;

export async function budgetUtilizationTotals(budgetId: string): Promise<{
  spent: number;
  committed: number;
}> {
  const [spentRow] = await db
    .select({ total: sum(requisitions.estimatedTotal) })
    .from(requisitions)
    .where(
      and(
        eq(requisitions.budgetId, budgetId),
        isNull(requisitions.deletedAt),
        inArray(requisitions.status, [...SPENT_STATUSES]),
      ),
    );

  const [committedRow] = await db
    .select({ total: sum(requisitions.estimatedTotal) })
    .from(requisitions)
    .where(
      and(
        eq(requisitions.budgetId, budgetId),
        isNull(requisitions.deletedAt),
        inArray(requisitions.status, [...COMMITTED_STATUSES]),
      ),
    );

  return {
    spent: Number(spentRow?.total ?? 0),
    committed: Number(committedRow?.total ?? 0),
  };
}
