import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { budgets, departments } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function putBudget(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { name, departmentId, fiscalYear, amount, notes, organizationId, branchId } = body;
    const orgId = organizationId || branchId;
    const allocatedAmount = amount ?? body.allocatedAmount;

    const existing = await db.query.budgets.findFirst({
      where: and(eq(budgets.id, id), isNull(budgets.deletedAt)),
    });
    if (!existing) {
      return NextResponse.json({ message: 'Budget not found' }, { status: 404 });
    }

    const orgForDept = orgId ?? existing.organizationId;
    if (departmentId && orgForDept) {
      const dept = await db.query.departments.findFirst({
        where: and(eq(departments.id, departmentId), eq(departments.organizationId, orgForDept)),
      });
      if (!dept) {
        return NextResponse.json({ message: 'Department not found for this organization' }, { status: 400 });
      }
    }

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) patch.name = name;
    if (departmentId !== undefined) patch.departmentId = departmentId;
    if (fiscalYear !== undefined) patch.fiscalYear = String(fiscalYear);
    if (allocatedAmount !== undefined) {
      const num = Number(allocatedAmount);
      if (Number.isNaN(num) || num <= 0) {
        return NextResponse.json({ message: 'amount must be a positive number' }, { status: 400 });
      }
      patch.allocatedAmount = String(num);
    }
    if (notes !== undefined) patch.notes = notes;

    const [row] = await db.update(budgets).set(patch).where(eq(budgets.id, id)).returning();

    return NextResponse.json({ data: row, message: 'Budget updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('[putBudget]', err);
    return NextResponse.json({ message: 'Error updating budget' }, { status: 500 });
  }
}
