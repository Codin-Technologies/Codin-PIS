import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  requisitionItems,
  rfqQuotations,
  rfqQuotationItems,
  rfqSupplierTokens,
  rfqs,
} from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LineInput = {
  requisitionItemId: string;
  unitPrice: number;
  leadTime: string;
  remarks?: string;
};

export async function postRfqPortalSubmit(req: NextRequest, tokenParam: string) {
  try {
    if (!UUID_RE.test(tokenParam)) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 404 });
    }

    const body = await req.json();
    const { currency, validityDate, paymentTerms, incoterms, notes, items } = body;

    if (!validityDate || !paymentTerms || !incoterms || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'validityDate, paymentTerms, incoterms, and items[] are required' },
        { status: 400 },
      );
    }

    const tokenRow = await db.query.rfqSupplierTokens.findFirst({
      where: and(eq(rfqSupplierTokens.token, tokenParam), isNull(rfqSupplierTokens.deletedAt)),
    });

    if (!tokenRow) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 404 });
    }

    const now = new Date();
    if (tokenRow.expiresAt < now) {
      return NextResponse.json({ message: 'Token expired' }, { status: 400 });
    }

    const rfq = await db.query.rfqs.findFirst({
      where: and(eq(rfqs.id, tokenRow.rfqId), isNull(rfqs.deletedAt)),
    });

    if (!rfq) {
      return NextResponse.json({ message: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.status !== 'sent') {
      return NextResponse.json({ message: 'RFQ is not accepting responses' }, { status: 400 });
    }

    const existing = await db.query.rfqQuotations.findFirst({
      where: and(eq(rfqQuotations.tokenId, tokenRow.id), eq(rfqQuotations.status, 'submitted')),
    });
    if (existing) {
      return NextResponse.json({ message: 'Quotation already submitted' }, { status: 409 });
    }

    const reqLines = await db.query.requisitionItems.findMany({
      where: eq(requisitionItems.requisitionId, rfq.requisitionId),
    });

    if (reqLines.length === 0) {
      return NextResponse.json({ message: 'No line items on source requisition' }, { status: 400 });
    }

    const allowedIds = new Set(reqLines.map((l) => l.id));
    const lines: LineInput[] = items.map((it: LineInput) => ({
      requisitionItemId: it.requisitionItemId,
      unitPrice: Number(it.unitPrice),
      leadTime: String(it.leadTime ?? '').trim(),
      remarks: it.remarks,
    }));

    if (lines.length !== reqLines.length) {
      return NextResponse.json(
        { message: 'Must submit pricing for every requisition line item' },
        { status: 400 },
      );
    }

    const seen = new Set<string>();
    for (const line of lines) {
      if (!line.requisitionItemId || !allowedIds.has(line.requisitionItemId)) {
        return NextResponse.json({ message: 'Invalid requisitionItemId in items' }, { status: 400 });
      }
      if (seen.has(line.requisitionItemId)) {
        return NextResponse.json({ message: 'Duplicate requisitionItemId' }, { status: 400 });
      }
      seen.add(line.requisitionItemId);
      if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) {
        return NextResponse.json({ message: 'Each item needs a valid unitPrice' }, { status: 400 });
      }
      if (!line.leadTime) {
        return NextResponse.json({ message: 'Each item needs leadTime' }, { status: 400 });
      }
    }

    const qtyByReqId = new Map(reqLines.map((l) => [l.id, l.qty]));
    let total = 0;
    for (const line of lines) {
      const q = qtyByReqId.get(line.requisitionItemId) ?? 0;
      total += line.unitPrice * q;
    }

    const result = await db.transaction(async (tx) => {
      const [qRow] = await tx
        .insert(rfqQuotations)
        .values({
          rfqId: rfq.id,
          supplierId: tokenRow.supplierId,
          tokenId: tokenRow.id,
          currency: typeof currency === 'string' && currency.trim() ? currency.trim() : 'USD',
          validityDate: String(validityDate),
          paymentTerms: String(paymentTerms),
          incoterms: String(incoterms),
          notes: notes != null ? String(notes) : null,
          totalAmount: String(total.toFixed(2)),
          status: 'submitted',
          submittedAt: now,
        })
        .returning();

      if (!qRow) throw new Error('insert quotation failed');

      await tx.insert(rfqQuotationItems).values(
        lines.map((line) => ({
          quotationId: qRow.id,
          requisitionItemId: line.requisitionItemId,
          unitPrice: String(line.unitPrice),
          leadTime: line.leadTime,
          remarks: line.remarks?.trim() || null,
        })),
      );

      await tx
        .update(rfqSupplierTokens)
        .set({ usedAt: now, updatedAt: now })
        .where(eq(rfqSupplierTokens.id, tokenRow.id));

      return qRow;
    });

    return NextResponse.json(
      {
        data: {
          quotationId: result.id,
          totalAmount: Number(result.totalAmount ?? 0),
          submittedAt: result.submittedAt?.toISOString?.() ?? now.toISOString(),
        },
        message: 'Quotation submitted',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[postRfqPortalSubmit]', err);
    return NextResponse.json({ message: 'Error submitting quotation' }, { status: 500 });
  }
}
