import { NextRequest, NextResponse } from 'next/server';
import { patchRequisitionStatus } from './patch';

/**
 * @swagger
 * /api/requisitions/{id}/status:
 *   patch:
 *     summary: Update requisition workflow status
 *     tags: [Procurement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 description: pending, in_review, approved, rejected, ordered, delivered
 *                 example: approved
 *     responses:
 *       200:
 *         description: Updated requisition
 *       400:
 *         description: Invalid status
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

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'requisitions.update');
  if (err) return err;
  const { id } = await context.params;
  return patchRequisitionStatus(request, id);
}
