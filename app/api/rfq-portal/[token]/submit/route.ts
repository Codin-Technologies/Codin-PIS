import { NextRequest } from 'next/server';
import { postRfqPortalSubmit } from './post';

/**
 * @swagger
 * /api/rfq-portal/{token}/submit:
 *   post:
 *     summary: Submit supplier quotation (public)
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - validityDate
 *               - paymentTerms
 *               - incoterms
 *               - items
 *             properties:
 *               currency:
 *                 type: string
 *               validityDate:
 *                 type: string
 *               paymentTerms:
 *                 type: string
 *               incoterms:
 *                 type: string
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - requisitionItemId
 *                     - unitPrice
 *                     - leadTime
 *                   properties:
 *                     requisitionItemId:
 *                       type: string
 *                       format: uuid
 *                     unitPrice:
 *                       type: number
 *                     leadTime:
 *                       type: string
 *                     remarks:
 *                       type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation or expired token
 *       404:
 *         description: Invalid token
 *       409:
 *         description: Already submitted
 */

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  return postRfqPortalSubmit(request, token);
}
