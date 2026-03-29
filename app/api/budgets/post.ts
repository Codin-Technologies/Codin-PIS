import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { budgets, departments } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function postBudget(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, departmentId, organizationId, branchId, fiscalYear, amount, notes } = body;
    const orgId = organizationId || branchId;
    const allocatedAmount = amount ?? body.allocatedAmount;

    if (!name || !departmentId || !orgId || !fiscalYear || allocatedAmount == null) {
      return NextResponse.json(
        { message: 'name, departmentId, organizationId (or branchId), fiscalYear, and amount are required' },
        { status: 400 },
      );
    }

    const dept = await db.query.departments.findFirst({
      where: and(eq(departments.id, departmentId), eq(departments.organizationId, orgId)),
    });
    if (!dept) {
      return NextResponse.json({ message: 'Department not found for this organization' }, { status: 400 });
    }

    const num = Number(allocatedAmount);
    if (Number.isNaN(num) || num <= 0) {
      return NextResponse.json({ message: 'amount must be a positive number' }, { status: 400 });
    }

    const [row] = await db
      .insert(budgets)
      .values({
        name,
        departmentId,
        organizationId: orgId,
        fiscalYear: String(fiscalYear),
        allocatedAmount: String(num),
        notes: notes ?? null,
      })
      .returning();

    return NextResponse.json({ data: row, message: 'Budget created successfully' }, { status: 201 });
  } catch (err) {
    console.error('[postBudget]', err);
    return NextResponse.json({ message: 'Error creating budget' }, { status: 500 });
  }
}
