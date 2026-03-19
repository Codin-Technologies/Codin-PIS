import { NextRequest, NextResponse } from 'next/server';
import { getDepartments } from './get';
import { postDepartment } from './post';

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: List all departments (filter by ?organizationId=)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Filter departments by organization UUID
 *     responses:
 *       200:
 *         description: List of departments
 *   post:
 *     summary: Create a new department
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
 *               - organizationId
 *             properties:
 *               name:
 *                 type: string
 *               organizationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created
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
  const err = await assertAuth(request, 'departments.read');
  if (err) return err;
  return getDepartments(request);
}

export async function POST(request: NextRequest) {
  const err = await assertAuth(request, 'departments.create');
  if (err) return err;
  return postDepartment(request);
}
