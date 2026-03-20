import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               qty:
 *                 type: integer
 *               unit:
 *                 type: string
 *               icon:
 *                 type: string
 *               minQty:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 *   patch:
 *     summary: Adjust quantity (increment or decrement)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - delta
 *             properties:
 *               delta:
 *                 type: integer
 *                 description: Amount to add (positive) or subtract (negative) from current qty
 *     responses:
 *       200:
 *         description: Quantity updated
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 *       404:
 *         description: Item not found
 */

import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';
import { putInventoryItem } from './put';
import { patchInventoryQty } from './patch';
import { deleteInventoryItem } from './delete';

async function assertAuth(request: NextRequest, permission: string) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message) return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed) return NextResponse.json({ timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' }, { status: 403 });
  return null;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'inventory.update');
  if (err) return err;
  return putInventoryItem(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'inventory.update');
  if (err) return err;
  return patchInventoryQty(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'inventory.delete');
  if (err) return err;
  return deleteInventoryItem(request, context);
}
