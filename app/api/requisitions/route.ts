import { NextRequest, NextResponse } from 'next/server';
import { getRequisitions } from './get';
import { postRequisition } from './post';

/**
 * @swagger
 * /api/requisitions:
 *   get:
 *     summary: List requisitions for an organization
 *     tags: [Procurement]
 *     parameters:
 *       - in: query
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Organization UUID
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter (e.g. pending, approved, or All)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: dept
 *         schema:
 *           type: string
 *         description: Alias for departmentId
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list (data, total, page, pageSize)
 *       400:
 *         description: Missing branchId
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   post:
 *     summary: Create a requisition with line items
 *     tags: [Procurement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *               - departmentId
 *               - items
 *             properties:
 *               branchId:
 *                 type: string
 *                 format: uuid
 *                 description: Organization UUID
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               budgetId:
 *                 type: string
 *                 format: uuid
 *               fiscalYear:
 *                 type: string
 *               priority:
 *                 type: string
 *                 example: Normal
 *               deliveryDate:
 *                 type: string
 *               reason:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - inventoryItemId
 *                     - qty
 *                   properties:
 *                     inventoryItemId:
 *                       type: string
 *                       format: uuid
 *                     qty:
 *                       type: integer
 *                     estimatedUnitPrice:
 *                       type: number
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

async function assertAuth(request: NextRequest, permission: string): Promise<NextResponse | null> {
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
  return null;
}

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

export async function GET(request: NextRequest) {
  const user = await assertAuthUser(request, 'requisitions.read');
  if (user instanceof NextResponse) return user;
  return getRequisitions(request, user);
}

export async function POST(request: NextRequest) {
  const user = await assertAuthUser(request, 'requisitions.create');
  if (user instanceof NextResponse) return user;
  return postRequisition(request, user);
}
