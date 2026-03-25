import { NextRequest, NextResponse } from 'next/server';
import { getProductionPlans } from './get';
import { postProductionPlan } from './post';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/kitchen/production:
 *   get:
 *     summary: List all production plans with their ingredients
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of production plans
 *   post:
 *     summary: Create a new production plan
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
 *               - dishName
 *               - ingredients
 *             properties:
 *               dishName:
 *                 type: string
 *               targetServings:
 *                 type: integer
 *                 default: 1
 *               estimatedStartTime:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     inventoryItemId:
 *                       type: string
 *                     qty:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Production plan created
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
  return getProductionPlans();
}

export async function POST(request: NextRequest) {
  const err = await assertAuth(request, 'kitchen.create');
  if (err) return err;
  return postProductionPlan(request);
}
