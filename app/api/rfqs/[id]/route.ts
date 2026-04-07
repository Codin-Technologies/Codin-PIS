import { NextRequest, NextResponse } from 'next/server';
import { getRfqById } from './get';

/**
 * @swagger
 * /api/rfqs/{id}:
 *   get:
 *     summary: Get one RFQ with suppliers and line items
 *     description: |
 *       Requires rfqs.read. Returns requisition line items (from requisition_items) and invited suppliers.
 *       User must belong to the RFQ's organization.
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
 *         description: RFQ detail in data envelope (suppliers, items, rfqNumber, status, etc.)
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'rfqs.read');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return getRfqById(request, id, user);
}
