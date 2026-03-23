import { NextRequest, NextResponse } from 'next/server';
import { getStockUsages } from './get';
import { postStockUsage } from './post';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/inventory/usage:
 *   get:
 *     summary: List all stock usage records
 *     description: Returns all stock usage records with recorder info and line items. Filter by organization using query params.
 *     tags: [Stock Usage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter records by organization UUID
 *     responses:
 *       200:
 *         description: List of usage records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       date:
 *                         type: string
 *                         example: "2026-03-23"
 *                       reason:
 *                         type: string
 *                         enum: [Waste, Consumption, Theft, Other]
 *                       notes:
 *                         type: string
 *                         nullable: true
 *                       organizationId:
 *                         type: string
 *                         format: uuid
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       recordedBy:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       itemsCount:
 *                         type: integer
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             inventoryItemId:
 *                               type: string
 *                             inventoryItemName:
 *                               type: string
 *                             unit:
 *                               type: string
 *                             qtyUsed:
 *                               type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Record new stock usage
 *     description: >
 *       Creates a stock usage record and atomically deducts quantities from inventory items.
 *       Validates that qtyUsed is positive and that the deduction would not result in negative stock.
 *     tags: [Stock Usage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - reason
 *               - organizationId
 *               - items
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2026-03-23"
 *                 description: ISO date string (YYYY-MM-DD)
 *               reason:
 *                 type: string
 *                 enum: [Waste, Consumption, Theft, Other]
 *               notes:
 *                 type: string
 *                 nullable: true
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *               recordedById:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: User ID of the person recording the usage
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - inventoryItemId
 *                     - qtyUsed
 *                   properties:
 *                     inventoryItemId:
 *                       type: string
 *                       format: uuid
 *                     qtyUsed:
 *                       type: number
 *                       minimum: 0.001
 *                       description: Must be positive. Cannot exceed available stock.
 *     responses:
 *       201:
 *         description: Usage recorded and inventory deducted successfully
 *       400:
 *         description: Validation error (missing fields, invalid reason, qtyUsed <= 0)
 *       404:
 *         description: One or more inventory items not found
 *       422:
 *         description: Insufficient stock — deduction would create negative inventory
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

async function assertAuth(request: NextRequest, permission: string) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized. Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message)
    return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed)
    return NextResponse.json(
      { timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' },
      { status: 403 }
    );
  return null;
}

export async function GET(request: NextRequest) {
  const err = await assertAuth(request, 'inventory.read');
  if (err) return err;
  return getStockUsages(request);
}

export async function POST(request: NextRequest) {
  const err = await assertAuth(request, 'inventory.create');
  if (err) return err;
  return postStockUsage(request);
}
