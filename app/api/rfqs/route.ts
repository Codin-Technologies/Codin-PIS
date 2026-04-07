import { NextRequest, NextResponse } from 'next/server';
import { getRfqs } from './get';
import { postRfq } from './post';

/**
 * @swagger
 * /api/rfqs:
 *   get:
 *     summary: List RFQs for an organization
 *     description: Requires rfqs.read. branchId must match the signed-in user's organization.
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
 *         description: draft | sent | evaluating | awarded | cancelled
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter by title, rfqNumber, or category
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
 *     summary: Create an RFQ from an approved requisition
 *     description: |
 *       Requires rfqs.create. requisitionId is required; the requisition must be **approved** and in the same organization.
 *       Line items are not posted — they are read from the requisition's requisition_items on GET.
 *       supplierIds is optional (deduplicated server-side).
 *     tags: [Procurement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *               - requisitionId
 *               - title
 *             properties:
 *               branchId:
 *                 type: string
 *                 format: uuid
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *               requisitionId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               paymentTerms:
 *                 type: string
 *               requiredDelivery:
 *                 type: string
 *                 description: ISO date e.g. 2026-08-01
 *               deadline:
 *                 type: string
 *                 description: Supplier response deadline (ISO or display string)
 *               supplierIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Created (data includes suppliers and items from requisition)
 *       400:
 *         description: Validation error (e.g. requisition not approved or wrong org)
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
  const user = await assertAuthUser(request, 'rfqs.read');
  if (user instanceof NextResponse) return user;
  return getRfqs(request, user);
}

export async function POST(request: NextRequest) {
  const user = await assertAuthUser(request, 'rfqs.create');
  if (user instanceof NextResponse) return user;
  return postRfq(request, user);
}
