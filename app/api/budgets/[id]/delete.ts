import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { budgets } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function deleteBudget(req: NextRequest, id: string) {
  try {
    const existing = await db.query.budgets.findFirst({
      where: and(eq(budgets.id, id), isNull(budgets.deletedAt)),
    });
    if (!existing) {
      return NextResponse.json({ message: 'Budget not found' }, { status: 404 });
    }

    await db
      .update(budgets)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(budgets.id, id));

    return NextResponse.json({ message: 'Budget deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('[deleteBudget]', err);
    return NextResponse.json({ message: 'Error deleting budget' }, { status: 500 });
  }
}
