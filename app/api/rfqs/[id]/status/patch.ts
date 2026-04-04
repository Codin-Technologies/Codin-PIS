import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfqs, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';
import { normalizeRfqStatus } from '@/lib/procurement/rfq-status';

export async function patchRfqStatus(req: NextRequest, id: string, authUser: AuthenticatedUser) {
  try {
    const body = await req.json();
    const raw = body?.status;
    if (raw == null || typeof raw !== 'string') {
      return NextResponse.json({ message: 'status is required' }, { status: 400 });
    }

    const status = normalizeRfqStatus(raw);
    if (!status) {
      return NextResponse.json(
        { message: 'Invalid status. Use draft, sent, evaluating, awarded, or cancelled' },
        { status: 400 },
      );
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const existing = await db.query.rfqs.findFirst({
      where: and(eq(rfqs.id, id), isNull(rfqs.deletedAt)),
    });
    if (!existing) {
      return NextResponse.json({ message: 'RFQ not found' }, { status: 404 });
    }
    if (existing.organizationId !== dbUser.organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const [row] = await db
      .update(rfqs)
      .set({ status, updatedAt: new Date() })
      .where(eq(rfqs.id, id))
      .returning();

    if (!row) {
      return NextResponse.json({ message: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json(
      {
        data: {
          id: row.id,
          status: row.status,
          updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
        },
        message: 'RFQ status updated',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[patchRfqStatus]', err);
    return NextResponse.json({ message: 'Error updating RFQ status' }, { status: 500 });
  }
}
