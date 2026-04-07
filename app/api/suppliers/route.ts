import { NextRequest, NextResponse } from 'next/server';
import { getSuppliers } from './get';
import { postSupplier } from './post';

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: List suppliers for an organization
 *     description: Requires suppliers.read. branchId must match the signed-in user's organization.
 *     tags: [Procurement]
 *     parameters:
 *       - in: query
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Organization UUID (same as organizationId)
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional alias for branchId
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter by name, category, contact, or email (client-side filter after fetch)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: e.g. Active, Inactive, Under Review
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list (data, total, page, pageSize)
 *       400:
 *         description: Missing branchId
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (wrong org or missing suppliers.read)
 *   post:
 *     summary: Create a supplier
 *     description: Requires suppliers.create.
 *     tags: [Procurement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *               - name
 *               - category
 *             properties:
 *               branchId:
 *                 type: string
 *                 format: uuid
 *                 description: Organization UUID
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *                 description: Same as branchId
 *               name:
 *                 type: string
 *                 description: Company / supplier name
 *               category:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *               vatNumber:
 *                 type: string
 *               paymentTerms:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created (body includes data supplier object)
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

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
  const user = await assertAuthUser(request, 'suppliers.read');
  if (user instanceof NextResponse) return user;
  return getSuppliers(request, user);
}

export async function POST(request: NextRequest) {
  const user = await assertAuthUser(request, 'suppliers.create');
  if (user instanceof NextResponse) return user;
  return postSupplier(request, user);
}
