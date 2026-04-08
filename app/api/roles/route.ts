import { NextRequest, NextResponse } from 'next/server';
import { getRoles } from './get';
import { postRole } from './post';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';
/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: List all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: A list of roles
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permission UUIDs to assign to this role
 *     responses:
 *       201:
 *         description: Role created successfully
 */

// ── Real handlers with RBAC ───────────────────────────────────────────────────
async function getUserContext(request: NextRequest, permission: string): Promise<NextResponse | AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message) return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed) return NextResponse.json({ timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' }, { status: 403 });
  return user as AuthenticatedUser;
}

export async function GET(request: NextRequest) {
  const user = await getUserContext(request, 'roles.read');
  if (user instanceof NextResponse) return user;
  return getRoles(user);
}

export async function POST(request: NextRequest) {
  const user = await getUserContext(request, 'roles.create');
  if (user instanceof NextResponse) return user;
  return postRole(request, user);
}
