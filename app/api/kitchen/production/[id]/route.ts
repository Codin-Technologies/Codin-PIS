import { NextRequest, NextResponse } from 'next/server';
import { patchProductionPlan } from './patch';
import { deleteProductionPlan } from './delete';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/kitchen/production/{id}:
 *   patch:
 *     summary: Update production plan status
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Planned, In Prep, Cooked, Completed]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Plan not found
 *   delete:
 *     summary: Delete a production plan
 *     description: Removes the plan and its ingredient rows (cascade). Requires kitchen.update.
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
 *         description: Plan deleted
 *       404:
 *         description: Plan not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

async function assertAuth(request: NextRequest, permission: string) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message) return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed) return NextResponse.json({ timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' }, { status: 403 });
  return null;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'kitchen.update');
  if (err) return err;
  return patchProductionPlan(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'kitchen.update');
  if (err) return err;
  return deleteProductionPlan(request, context);
}
