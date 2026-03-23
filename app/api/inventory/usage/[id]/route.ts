import { NextRequest, NextResponse } from 'next/server';
import { getStockUsageById } from './get';
import { deleteStockUsage } from './delete';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/inventory/usage/{id}:
 *   get:
 *     summary: Get a single stock usage record by ID
 *     description: Returns a stock usage record with all line items and current inventory levels.
 *     tags: [Stock Usage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the stock usage record
 *     responses:
 *       200:
 *         description: Stock usage record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     date:
 *                       type: string
 *                       example: "2026-03-23"
 *                     reason:
 *                       type: string
 *                       enum: [Waste, Consumption, Theft, Other]
 *                     notes:
 *                       type: string
 *                       nullable: true
 *                     organizationId:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     recordedBy:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           inventoryItemId:
 *                             type: string
 *                           inventoryItemName:
 *                             type: string
 *                           unit:
 *                             type: string
 *                           currentStock:
 *                             type: number
 *                             description: Current remaining quantity after this usage was applied
 *                           qtyUsed:
 *                             type: number
 *                 message:
 *                   type: string
 *       404:
 *         description: Record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Soft-delete a stock usage record
 *     description: >
 *       Soft-deletes the usage record by setting deleted_at. 
 *       **Does NOT reverse the inventory quantity deductions** — 
 *       the physical consumption already occurred.
 *     tags: [Stock Usage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the stock usage record to delete
 *     responses:
 *       200:
 *         description: Record soft-deleted successfully
 *       404:
 *         description: Record not found
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await assertAuth(request, 'inventory.read');
  if (err) return err;
  const { id } = await params;
  return getStockUsageById(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await assertAuth(request, 'inventory.delete');
  if (err) return err;
  const { id } = await params;
  return deleteStockUsage(request, id);
}
