import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfqSupplierTokens, rfqs } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getRfqPortal(req: NextRequest, tokenParam: string) {
  try {
    if (!UUID_RE.test(tokenParam)) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 404 });
    }

    const row = await db.query.rfqSupplierTokens.findFirst({
      where: and(eq(rfqSupplierTokens.token, tokenParam), isNull(rfqSupplierTokens.deletedAt)),
    });

    if (!row) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 404 });
    }

    const now = new Date();
    if (row.expiresAt < now) {
      return NextResponse.json({ status: 'expired' as const }, { status: 200 });
    }

    const rfq = await db.query.rfqs.findFirst({
      where: and(eq(rfqs.id, row.rfqId), isNull(rfqs.deletedAt)),
      with: {
        organization: true,
        requisition: {
          with: {
            items: { with: { inventoryItem: true } },
          },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json({ message: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.status !== 'sent') {
      return NextResponse.json({ status: 'closed' as const }, { status: 200 });
    }

    if (!row.usedAt) {
      await db
        .update(rfqSupplierTokens)
        .set({ usedAt: now, updatedAt: now })
        .where(eq(rfqSupplierTokens.id, row.id));
    }

    const items =
      rfq.requisition?.items?.map((li) => {
        const inv = li.inventoryItem;
        const spec = inv?.description?.trim() || inv?.name || '';
        return {
          id: li.id,
          name: inv?.name ?? 'Item',
          specification: spec,
          quantity: li.qty,
          unit: inv?.unit ?? 'pcs',
        };
      }) ?? [];

    return NextResponse.json(
      {
        status: 'open' as const,
        rfq: {
          id: rfq.id,
          referenceNumber: rfq.rfqNumber,
          title: rfq.title,
          description: rfq.description ?? '',
          issuingCompany: rfq.organization?.name ?? '',
          deadline: rfq.deadline ?? row.expiresAt.toISOString().slice(0, 10),
          terms: rfq.terms ?? '',
          items,
          attachments: [] as { name: string; size: string }[],
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[getRfqPortal]', err);
    return NextResponse.json({ message: 'Error loading RFQ' }, { status: 500 });
  }
}
