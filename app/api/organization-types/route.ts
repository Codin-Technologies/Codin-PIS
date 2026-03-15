import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationTypes } from './get';
import { postOrganizationType } from './post';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/organization-types:
 *   get:
 *     summary: List all organization types
 *     tags: [Organization Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of organization types
 *   post:
 *     summary: Create a new organization type
 *     tags: [Organization Types]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       201:
 *         description: Organization type created successfully
 */

// ── Real handlers with RBAC ───────────────────────────────────────────────────
async function assertAuth(request: NextRequest, permission: string) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized Please login' }, { status: 401 });
  if ((user as AuthenticatedError).message) return NextResponse.json({ message: (user as AuthenticatedError).message }, { status: 400 });
  // NOTE: For simplicity, checking 'organizations.*' permission here or a dedicated one if it exists.
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed) return NextResponse.json({ timestamp: new Date(), success: false, message: 'Forbidden!! Contact Administrator' }, { status: 403 });
  return null;
}

export async function GET(request: NextRequest) {
  const err = await assertAuth(request, 'organizations.read');
  if (err) return err;
  return getOrganizationTypes();
}

export async function POST(request: NextRequest) {
  const err = await assertAuth(request, 'organizations.create');
  if (err) return err;
  return postOrganizationType(request);
}
