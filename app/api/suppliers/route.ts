import { NextRequest, NextResponse } from 'next/server';
import { getSuppliers } from './get';
import { postSupplier } from './post';

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: List suppliers for an organization
 *     tags: [Procurement]
 *   post:
 *     summary: Create a supplier
 *     tags: [Procurement]
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

export async function GET(request: NextRequest) {
  const user = await assertAuthUser(request, 'suppliers.read');
  if (user instanceof NextResponse) return user;
  return getSuppliers(request, user);
}

export async function POST(request: NextRequest) {
  const user = await assertAuthUser(request, 'suppliers.create');
  if (user instanceof NextResponse) return user;
  return postSupplier(request, user);
}
