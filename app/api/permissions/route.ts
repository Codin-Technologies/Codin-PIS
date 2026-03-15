import { NextRequest } from 'next/server';
import { getPermissions } from './get';
import { postPermission } from './post';

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: List all permissions grouped by permission groups
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A structured tree of permissions
 *   post:
 *     summary: Create a new explicit permission (e.g. users.create)
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
 *               groupId:
 *                 type: string
 *             required:
 *               - name
 *               - groupId
 *     responses:
 *       201:
 *         description: Permission created successfully
 */
export async function GET() {
  return getPermissions();
}

export async function POST(request: NextRequest) {
  return postPermission(request);
}
