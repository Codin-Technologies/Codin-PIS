import { NextRequest, NextResponse } from 'next/server';
import { deleteDepartment } from './delete';

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     description: Requires departments.delete. User must belong to the department's organization. Fails with 409 if inventory, budgets, or requisitions still reference this department.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Department removed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       409:
 *         description: Department still referenced by other records
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

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'departments.delete');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return deleteDepartment(request, id, user);
}
