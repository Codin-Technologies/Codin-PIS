import { NextRequest } from 'next/server';
import { getRfqPortal } from './get';

/**
 * @swagger
 * /api/rfq-portal/{token}:
 *   get:
 *     summary: Public supplier RFQ portal payload
 *     description: No authentication. Token is the UUID from the invite link path.
 *     tags: [RFQ Portal]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: status open | expired | closed, or rfq object when open
 *       404:
 *         description: Invalid token
 */

export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  return getRfqPortal(request, token);
}
