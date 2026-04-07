import { NextRequest, NextResponse } from 'next/server';
import { patchRfqStatus } from './patch';

/**
 * @swagger
 * /api/rfqs/{id}/status:
 *   patch:
 *     summary: Update RFQ workflow status
 *     description: Requires rfqs.update. Valid status values — draft, sent, evaluating, awarded, cancelled.
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
 *                 enum: [draft, sent, evaluating, awarded, cancelled]
 *     responses:
 *       200:
 *         description: Status updated (data.id, data.status)
 *       400:
 *         description: Missing or invalid status
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFQ not found
 *       401:
 *         description: Unauthorized
 */
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

async function assertAuthUser(
  request: NextRequest,
  permission: string,
): Promise<NextResponse | AuthenticatedUser> {
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
  return user as AuthenticatedUser;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'rfqs.update');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return patchRfqStatus(request, id, user);
}
