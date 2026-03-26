import { NextRequest, NextResponse } from 'next/server';
import { deductProductionPlanStock } from './post';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/kitchen/production/{id}/deduct:
 *   post:
 *     summary: Deduct stock for a production plan
 *     description: Decrements inventory based on production plan ingredients and marks plan as Completed. Can only be run once per plan.
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock deducted successfully
 *       400:
 *         description: Stock already deducted
 *       404:
 *         description: Plan not found
 */

async function assertAuth(request: NextRequest, permission: string) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message) return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed) return NextResponse.json({ timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' }, { status: 403 });
  return null;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'kitchen.deduct');
  if (err) return err;
  return deductProductionPlanStock(request, context);
}
