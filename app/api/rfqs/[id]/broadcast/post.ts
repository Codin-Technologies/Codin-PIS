import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfqSupplierTokens, rfqs, users } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { AuthenticatedUser } from '@/lib/auth/utils';
import { sendRFQInviteEmail } from '@/lib/mail';
import {
  buildWhatsAppLink,
  computeTokenExpiresAt,
  newPortalTokenValue,
  phoneToWhatsAppParam,
} from '@/lib/procurement/rfq-broadcast';

export async function postBroadcastRfq(req: NextRequest, rfqId: string, authUser: AuthenticatedUser) {
  try {
    const full = await db.query.rfqs.findFirst({
      where: and(eq(rfqs.id, rfqId), isNull(rfqs.deletedAt)),
      with: {
        organization: true,
        rfqSuppliers: { with: { supplier: true } },
      },
    });

    if (!full) {
      return NextResponse.json({ message: 'RFQ not found' }, { status: 404 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });
    if (!dbUser || dbUser.organizationId !== full.organizationId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!full.rfqSuppliers?.length) {
      return NextResponse.json({ message: 'No suppliers linked to this RFQ' }, { status: 400 });
    }

    const appUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    const expiresAt = computeTokenExpiresAt(full.deadline);
    const issuingCompany = full.organization?.name ?? 'Your customer';
    const deadlineDisplay = full.deadline?.trim() || expiresAt.toISOString().slice(0, 10);

    const results: Array<{
      supplierId: string;
      name: string;
      email: string | null;
      emailSent: boolean;
      emailError?: string;
      phone: string | null;
      whatsappLink: string | null;
      portalLink: string;
    }> = [];

    for (const rs of full.rfqSuppliers) {
      const sup = rs.supplier;
      if (!sup) continue;

      const newToken = newPortalTokenValue();
      const existing = await db.query.rfqSupplierTokens.findFirst({
        where: and(
          eq(rfqSupplierTokens.rfqId, rfqId),
          eq(rfqSupplierTokens.supplierId, sup.id),
          isNull(rfqSupplierTokens.deletedAt),
        ),
      });

      let urlToken: string;

      if (existing) {
        await db
          .update(rfqSupplierTokens)
          .set({
            token: newToken,
            expiresAt,
            sentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(rfqSupplierTokens.id, existing.id));
        urlToken = newToken;
      } else {
        const [inserted] = await db
          .insert(rfqSupplierTokens)
          .values({
            rfqId,
            supplierId: sup.id,
            token: newToken,
            expiresAt,
            sentAt: new Date(),
          })
          .returning();
        if (!inserted) continue;
        urlToken = inserted.token;
      }

      const portalLink = `${appUrl}/supplier/rfq/${urlToken}`;
      const waDigits = phoneToWhatsAppParam(sup.phone);
      const waMessage = `You have been invited to quote on ${full.rfqNumber}: ${full.title}. Open: ${portalLink}`;
      const whatsappLink = waDigits ? buildWhatsAppLink(waDigits, waMessage) : null;

      let emailSent = false;
      let emailError: string | undefined;
      if (sup.email?.trim()) {
        try {
          await sendRFQInviteEmail({
            to: sup.email.trim(),
            supplierName: sup.name,
            rfqNumber: full.rfqNumber,
            rfqTitle: full.title,
            issuingCompany,
            deadline: deadlineDisplay,
            portalLink,
          });
          emailSent = true;
        } catch (e) {
          emailError = e instanceof Error ? e.message : 'Email failed';
        }
      }

      results.push({
        supplierId: sup.id,
        name: sup.name,
        email: sup.email ?? null,
        emailSent,
        ...(emailError ? { emailError } : {}),
        phone: sup.phone ?? null,
        whatsappLink,
        portalLink,
      });
    }

    await db
      .update(rfqs)
      .set({ status: 'sent', updatedAt: new Date() })
      .where(eq(rfqs.id, rfqId));

    return NextResponse.json(
      { data: results, message: 'RFQ broadcast processed' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[postBroadcastRfq]', err);
    return NextResponse.json({ message: 'Error broadcasting RFQ' }, { status: 500 });
  }
}
