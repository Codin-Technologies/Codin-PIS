import { NextRequest, NextResponse } from 'next/server';
import { getSpecialOrders } from './get';
import { postSpecialOrder } from './post';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/kitchen/special-orders:
 *   get:
 *     summary: List all special orders
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of special orders
 *   post:
 *     summary: Create a new special order
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestName
 *             properties:
 *               requestName:
 *                 type: string
 *               preparationNotes:
 *                 type: string
 *               priorityLevel:
 *                 type: string
 *                 enum: [Normal, High, Critical]
 *               logTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Special order created
 */

async function assertAuth(request: NextRequest, permission: string) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message) return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed) return NextResponse.json({ timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' }, { status: 403 });
  return null;
}

export async function GET(request: NextRequest) {
  const err = await assertAuth(request, 'kitchen.read');
  if (err) return err;
  return getSpecialOrders();
}

export async function POST(request: NextRequest) {
  const err = await assertAuth(request, 'kitchen.create');
  if (err) return err;
  return postSpecialOrder(request);
}
