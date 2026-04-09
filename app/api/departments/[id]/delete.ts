import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { departments, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';

function isPgForeignKeyViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === '23503';
}

export async function deleteDepartment(_req: NextRequest, id: string, authUser: AuthenticatedUser) {
  try {
    const existing = await db.query.departments.findFirst({
      where: eq(departments.id, id),
    });
    if (!existing) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser?.organizationId || dbUser.organizationId !== existing.organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await db.delete(departments).where(eq(departments.id, id));

    return NextResponse.json({ message: 'Department deleted successfully' }, { status: 200 });
  } catch (err) {
    if (isPgForeignKeyViolation(err)) {
      return NextResponse.json(
        {
          message:
            'Cannot delete this department while it is linked to inventory items, budgets, or requisitions. Reassign or remove those records first.',
        },
        { status: 409 },
      );
    }
    console.error('[deleteDepartment]', err);
    return NextResponse.json({ message: 'Error deleting department' }, { status: 500 });
  }
}
