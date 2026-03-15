import { NextRequest } from 'next/server';
import { getPermissionGroups } from './get';
import { postPermissionGroup } from './post';

/**
 * @swagger
 * /api/permission-groups:
 *   get:
 *     summary: List all permission groups (modules)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of permission groups
 *   post:
 *     summary: Create a new permission group
 *     tags: [Permissions]
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
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Group created successfully
 */
export async function GET() {
  return getPermissionGroups();
}

export async function POST(request: NextRequest) {
  return postPermissionGroup(request);
}
