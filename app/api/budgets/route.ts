import { NextRequest, NextResponse } from 'next/server';
import { getBudgets } from './get';
import { postBudget } from './post';

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: List budgets with spent / committed / remaining
 *     tags: [Procurement]
 *     parameters:
 *       - in: query
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization UUID (same as organizationId)
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Organization UUID (optional if branchId set)
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: fiscalYear
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of budgets with utilization fields
 *       400:
 *         description: Missing organizationId or branchId
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Create a budget
 *     tags: [Procurement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - departmentId
 *               - fiscalYear
 *               - amount
 *             properties:
 *               name:
 *                 type: string
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *               branchId:
 *                 type: string
 *                 format: uuid
 *                 description: Same as organizationId
 *               fiscalYear:
 *                 type: string
 *                 example: "2026"
 *               amount:
 *                 type: number
 *                 description: Allocated amount (positive)
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Budget created
 *       400:
 *         description: Validation error
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

export async function GET(request: NextRequest) {
  const err = await assertAuth(request, 'budgets.read');
  if (err) return err;
  return getBudgets(request);
}

export async function POST(request: NextRequest) {
  const err = await assertAuth(request, 'budgets.create');
  if (err) return err;
  return postBudget(request);
}
