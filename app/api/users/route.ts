import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from './get';
import { postUser } from './post';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - roleId
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               roleId:
 *                 type: string
 *               organizationId:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Hashed for storage; same value is sent in the welcome email when SMTP (e.g. SMTP_HOST) is configured.
 *     responses:
 *       201:
 *         description: User created successfully (welcomeEmailSent indicates if the welcome email was delivered)
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
  const user = await getUserContext(request, 'users.read');
  if (user instanceof NextResponse) return user;
  return getUsers(user);
}

export async function POST(request: NextRequest) {
  const user = await getUserContext(request, 'users.create');
  if (user instanceof NextResponse) return user;
  return postUser(request, user);
}
