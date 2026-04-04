import { NextRequest, NextResponse } from 'next/server';
import { getRfqs } from './get';
import { postRfq } from './post';
import { AuthenticatedError, AuthenticatedUser, getAuthenticatedUser } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';

/**
 * @swagger
 * /api/rfqs:
 *   get:
 *     summary: List RFQs for an organization
 *     tags: [Procurement]
 *   post:
 *     summary: Create an RFQ from an approved requisition
 *     tags: [Procurement]
 */

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
  const user = await assertAuthUser(request, 'rfqs.read');
  if (user instanceof NextResponse) return user;
  return getRfqs(request, user);
}

export async function POST(request: NextRequest) {
  const user = await assertAuthUser(request, 'rfqs.create');
  if (user instanceof NextResponse) return user;
  return postRfq(request, user);
}
