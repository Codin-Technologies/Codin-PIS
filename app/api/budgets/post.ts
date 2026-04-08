import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { budgets, departments } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { AuthenticatedUser } from '@/lib/auth/utils';

export async function postBudget(req: NextRequest, user: AuthenticatedUser) {
  try {
    const body = await req.json();
    const { name, departmentId, fiscalYear, amount, notes } = body;
    const organizationId = user.organizationId;
    const allocatedAmount = amount ?? body.allocatedAmount;

    if (!organizationId) {
      return NextResponse.json({ message: 'Organization context missing' }, { status: 400 });
    }

    if (!name || !departmentId || !fiscalYear || allocatedAmount == null) {
      return NextResponse.json(
        { message: 'name, departmentId, fiscalYear, and amount are required' },
        { status: 400 },
      );
    }

    const dept = await db.query.departments.findFirst({
      where: and(eq(departments.id, departmentId), eq(departments.organizationId, organizationId)),
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
        organizationId: organizationId,
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
