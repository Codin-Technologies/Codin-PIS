import { NextRequest, NextResponse } from 'next/server';
import { getInventory } from './get';
import { postInventory } from './post';

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: List all inventory items with computed stock status
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter items by department UUID
 *     responses:
 *       200:
 *         description: List of inventory items with status (Good/Low/Critical)
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - departmentId
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               qty:
 *                 type: integer
 *                 default: 0
 *               unit:
 *                 type: string
 *                 default: pcs
 *               icon:
 *                 type: string
 *                 default: "📦"
 *               minQty:
 *                 type: integer
 *                 default: 10
 *                 description: Threshold for Low/Critical status
 *     responses:
 *       201:
 *         description: Inventory item created
 */
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

async function assertAuth(request: NextRequest, permission: string) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message) return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed) return NextResponse.json({ timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' }, { status: 403 });
  return null;
}

export async function GET(request: NextRequest) {
  const err = await assertAuth(request, 'inventory.read');
  if (err) return err;
  return getInventory(request);
}

export async function POST(request: NextRequest) {
  const err = await assertAuth(request, 'inventory.create');
  if (err) return err;
  return postInventory(request);
}
