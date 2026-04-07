import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfqQuotations, rfqs, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';

export async function getRfqQuotations(req: NextRequest, rfqId: string, authUser: AuthenticatedUser) {
  try {
    const rfq = await db.query.rfqs.findFirst({
      where: and(eq(rfqs.id, rfqId), isNull(rfqs.deletedAt)),
    });
    if (!rfq) {
      return NextResponse.json({ message: 'RFQ not found' }, { status: 404 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser || dbUser.organizationId !== rfq.organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const quotes = await db.query.rfqQuotations.findMany({
      where: and(eq(rfqQuotations.rfqId, rfqId), eq(rfqQuotations.status, 'submitted')),
      with: {
        supplier: true,
        items: { with: { requisitionItem: { with: { inventoryItem: true } } } },
        attachments: true,
      },
      orderBy: (q, { desc }) => [desc(q.submittedAt)],
    });

    const data = quotes.map((q) => ({
      id: q.id,
      supplierId: q.supplierId,
      supplierName: q.supplier?.name ?? '',
      currency: q.currency,
      totalAmount: q.totalAmount != null ? Number(q.totalAmount) : null,
      validityDate: q.validityDate,
      paymentTerms: q.paymentTerms,
      incoterms: q.incoterms,
      notes: q.notes,
      submittedAt: q.submittedAt?.toISOString?.() ?? null,
      status: q.status,
      items: (q.items ?? []).map((li) => ({
        requisitionItemId: li.requisitionItemId,
        name: li.requisitionItem?.inventoryItem?.name ?? '',
        qty: li.requisitionItem?.qty ?? 0,
        unitPrice: Number(li.unitPrice),
        leadTime: li.leadTime,
        remarks: li.remarks,
      })),
      attachments: (q.attachments ?? []).map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileSize: a.fileSize,
      })),
    }));

    return NextResponse.json({ data, message: 'Quotations fetched' }, { status: 200 });
  } catch (err) {
    console.error('[getRfqQuotations]', err);
    return NextResponse.json({ message: 'Error fetching quotations' }, { status: 500 });
  }
}
