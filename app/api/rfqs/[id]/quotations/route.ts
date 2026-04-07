import { NextRequest, NextResponse } from 'next/server';
import { getRfqQuotations } from './get';

/**
 * @swagger
 * /api/rfqs/{id}/quotations:
 *   get:
 *     summary: List submitted quotations for an RFQ
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
 *         description: Quotations with line items and attachments
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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'rfqs.read');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return getRfqQuotations(request, id, user);
}
