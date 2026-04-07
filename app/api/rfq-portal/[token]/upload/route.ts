import { NextRequest } from 'next/server';
import { postRfqPortalUpload } from './post';

/**
 * @swagger
 * /api/rfq-portal/{token}/upload:
 *   post:
 *     summary: Upload quotation attachment (public)
 *     description: multipart/form-data field `file`. Call after POST .../submit.
 *     tags: [RFQ Portal]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Uploaded
 *       400:
 *         description: Missing file or submit first
 *       503:
 *         description: Storage not configured
 */

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  return postRfqPortalUpload(request, token);
}
