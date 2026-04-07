import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfqQuotations, suppliers, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';

export async function getSupplierQuotations(
  req: NextRequest,
  supplierId: string,
  authUser: AuthenticatedUser,
) {
  try {
    const supplier = await db.query.suppliers.findFirst({
      where: and(eq(suppliers.id, supplierId), isNull(suppliers.deletedAt)),
    });
    if (!supplier) {
      return NextResponse.json({ message: 'Supplier not found' }, { status: 404 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser || dbUser.organizationId !== supplier.organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const quotes = await db.query.rfqQuotations.findMany({
      where: and(eq(rfqQuotations.supplierId, supplierId), eq(rfqQuotations.status, 'submitted')),
      with: {
        rfq: true,
      },
      orderBy: (q, { desc }) => [desc(q.submittedAt)],
    });

    const data = quotes.map((q) => ({
      id: q.id,
      rfqId: q.rfqId,
      rfqNumber: q.rfq?.rfqNumber ?? '',
      rfqTitle: q.rfq?.title ?? '',
      currency: q.currency,
      totalAmount: q.totalAmount != null ? Number(q.totalAmount) : null,
      paymentTerms: q.paymentTerms,
      submittedAt: q.submittedAt?.toISOString?.() ?? null,
      status: q.status,
    }));

    return NextResponse.json({ data, message: 'Quotations fetched' }, { status: 200 });
  } catch (err) {
    console.error('[getSupplierQuotations]', err);
    return NextResponse.json({ message: 'Error fetching quotations' }, { status: 500 });
  }
}
