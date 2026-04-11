import { NextRequest, NextResponse } from 'next/server';
import { postBroadcastRfq } from './post';

/**
 * @swagger
 * /api/rfqs/{id}/broadcast:
 *   post:
 *     summary: Broadcast RFQ to linked suppliers
 *     description: |
 *       Requires rfqs.update. Creates or regenerates per-supplier portal tokens, sends invite emails (Resend),
 *       sets RFQ status to `sent`, and returns `whatsappLink` strings for the UI (no WhatsApp API call).
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
 *         description: Per-supplier results (portalLink, whatsappLink, emailSent)
 *       400:
 *         description: No suppliers on RFQ
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

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'rfqs.update');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return postBroadcastRfq(request, id, user);
}
