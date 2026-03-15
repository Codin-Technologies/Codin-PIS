import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationById } from './get';
import { putOrganization } from './put';
import { deleteOrganization } from './delete';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization details
 *   put:
 *     summary: Update an organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
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
 *       200:
 *         description: Organization updated
 *   delete:
 *     summary: Delete an organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization deleted
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'organizations.read');
  if (err) return err;
  const { id } = await params;
  return getOrganizationById(id);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'organizations.update');
  if (err) return err;
  const { id } = await params;
  return putOrganization(request, id);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await assertAuth(request, 'organizations.delete');
  if (err) return err;
  const { id } = await params;
  return deleteOrganization(id);
}
