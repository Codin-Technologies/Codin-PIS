import { NextRequest, NextResponse } from 'next/server';
import { getBudgetById } from './get';
import { putBudget } from './put';
import { deleteBudget } from './delete';

/**
 * @swagger
 * /api/budgets/{id}:
 *   get:
 *     summary: Get one budget with utilization
 *     tags: [Procurement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Budget with spent, committed, remaining, health
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   put:
 *     summary: Update a budget
 *     tags: [Procurement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               fiscalYear:
 *                 type: string
 *               amount:
 *                 type: number
 *               notes:
 *                 type: string
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *               branchId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Soft-delete a budget
 *     tags: [Procurement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

async function assertAuth(request: NextRequest, permission: string) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message)
    return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed)
    return NextResponse.json(
      { timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' },
      { status: 403 },
    );
  return null;
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'budgets.read');
  if (err) return err;
  const { id } = await context.params;
  return getBudgetById(request, id);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'budgets.update');
  if (err) return err;
  const { id } = await context.params;
  return putBudget(request, id);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'budgets.delete');
  if (err) return err;
  const { id } = await context.params;
  return deleteBudget(request, id);
}
