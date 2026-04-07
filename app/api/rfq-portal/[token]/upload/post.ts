import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfqQuotationAttachments, rfqQuotations, rfqSupplierTokens } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { getSupabaseAdmin, RFQ_ATTACHMENTS_BUCKET } from '@/lib/supabase';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_BYTES = 10 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'file';
}

export async function postRfqPortalUpload(req: NextRequest, tokenParam: string) {
  try {
    if (!UUID_RE.test(tokenParam)) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 404 });
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

    const quotation = await db.query.rfqQuotations.findFirst({
      where: eq(rfqQuotations.tokenId, tokenRow.id),
    });

    if (!quotation) {
      return NextResponse.json(
        { message: 'Submit your quotation first, then upload files' },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ message: 'file field is required (multipart/form-data)' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'File too large (max 10MB)' }, { status: 400 });
    }

    const originalName = file instanceof File ? file.name : 'upload';
    const safeName = sanitizeFileName(originalName);
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/octet-stream';
    const objectPath = `${quotation.id}/${Date.now()}_${safeName}`;

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ message: 'File storage is not configured' }, { status: 503 });
    }

    const { error: upErr } = await supabase.storage
      .from(RFQ_ATTACHMENTS_BUCKET)
      .upload(objectPath, buffer, { contentType, upsert: false });

    if (upErr) {
      console.error('[postRfqPortalUpload] storage', upErr);
      return NextResponse.json({ message: 'Upload failed', detail: upErr.message }, { status: 502 });
    }

    const { data: pub } = supabase.storage.from(RFQ_ATTACHMENTS_BUCKET).getPublicUrl(objectPath);
    const publicUrl = pub.publicUrl;

    const sizeLabel =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const [att] = await db
      .insert(rfqQuotationAttachments)
      .values({
        quotationId: quotation.id,
        fileName: originalName,
        fileUrl: publicUrl,
        fileSize: sizeLabel,
      })
      .returning();

    if (!att) {
      return NextResponse.json({ message: 'Failed to save attachment record' }, { status: 500 });
    }

    return NextResponse.json(
      {
        data: {
          id: att.id,
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileSize: att.fileSize,
        },
        message: 'File uploaded',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[postRfqPortalUpload]', err);
    return NextResponse.json({ message: 'Error uploading file' }, { status: 500 });
  }
}
