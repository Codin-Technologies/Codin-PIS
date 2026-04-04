import { NextRequest, NextResponse } from 'next/server';
import { getSupplierById } from './get';
import { putSupplier } from './put';
import { deleteSupplier } from './delete';
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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'suppliers.read');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return getSupplierById(request, id, user);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'suppliers.update');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return putSupplier(request, id, user);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await assertAuthUser(request, 'suppliers.delete');
  if (user instanceof NextResponse) return user;
  const { id } = await context.params;
  return deleteSupplier(request, id, user);
}
