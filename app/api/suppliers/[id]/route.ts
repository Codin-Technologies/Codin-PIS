import { NextRequest, NextResponse } from 'next/server';
import { getSupplierById } from './get';
import { putSupplier } from './put';
import { deleteSupplier } from './delete';

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get one supplier
 *     description: Requires suppliers.read. User must belong to the supplier's organization.
 *     tags: [Procurement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Supplier in data envelope
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update a supplier
 *     description: Requires suppliers.update.
 *     tags: [Procurement]
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *                 nullable: true
 *               email:
 *                 type: string
 *                 nullable: true
 *               phone:
 *                 type: string
 *                 nullable: true
 *               website:
 *                 type: string
 *                 nullable: true
 *               vatNumber:
 *                 type: string
 *                 nullable: true
 *               paymentTerms:
 *                 type: string
 *                 nullable: true
 *               streetAddress:
 *                 type: string
 *                 nullable: true
 *               status:
 *                 type: string
 *                 description: Active | Inactive | Under Review
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Soft-delete a supplier
 *     description: Requires suppliers.delete.
 *     tags: [Procurement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'suppliers.read');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return getSupplierById(request, id, user);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'suppliers.update');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return putSupplier(request, id, user);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'suppliers.delete');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return deleteSupplier(request, id, user);
}
