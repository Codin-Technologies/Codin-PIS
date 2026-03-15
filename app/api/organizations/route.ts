import { NextRequest, NextResponse } from 'next/server';
import { getOrganizations } from './get';
import { postOrganization } from './post';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: List all organizations
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: A list of organizations
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               organizationTypeId:
 *                 type: string
 *               location:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organization created successfully
 */

// ── Real handlers with RBAC ───────────────────────────────────────────────────
async function assertAuth(request: NextRequest, permission: string) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message) return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed) return NextResponse.json({ timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' }, { status: 403 });
  return null;
}

export async function GET(request: NextRequest) {
  const err = await assertAuth(request, 'organizations.read');
  if (err) return err;
  return getOrganizations();
}

export async function POST(request: NextRequest) {
  const err = await assertAuth(request, 'organizations.create');
  if (err) return err;
  return postOrganization(request);
}
