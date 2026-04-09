'use server';

import { getBaseUrl } from '@/lib/get-base-url';

export type SupplierPortalStatus = 'open' | 'closed' | 'expired' | 'invalid';

export type SupplierPortalAttachment = {
  name: string;
  size: string;
  url?: string;
};

export type SupplierPortalUploadedAttachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
};

export type SupplierPortalSubmittedQuotationItem = {
  requisitionItemId: string;
  unitPrice: number;
  leadTime: string;
  remarks: string;
};

export type SupplierPortalSubmittedQuotation = {
  quotationId: string;
  currency: string;
  validityDate: string;
  paymentTerms: string;
  incoterms: string;
  notes: string;
  totalAmount: number;
  submittedAt: string;
  items: SupplierPortalSubmittedQuotationItem[];
  attachments: SupplierPortalUploadedAttachment[];
};

export type SupplierPortalLineItem = {
  id: string;
  name: string;
  specification: string;
  quantity: number;
  unit: string;
};

export type SupplierPortalRfq = {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  issuingCompany: string;
  deadline: string;
  status: 'open';
  terms: string;
  items: SupplierPortalLineItem[];
  attachments: SupplierPortalAttachment[];
  submittedQuotation: SupplierPortalSubmittedQuotation | null;
};

export type SupplierPortalLoadResult =
  | { status: 'invalid' | 'expired' | 'closed' }
  | { status: 'open'; rfq: SupplierPortalRfq };

export type SupplierPortalQuotationPayload = {
  currency: string;
  validityDate: string;
  paymentTerms: string;
  incoterms: string;
  notes?: string;
  items: {
    requisitionItemId: string;
    unitPrice: number;
    leadTime: string;
    remarks?: string;
  }[];
};

export type SupplierPortalQuotationSubmitResult = {
  quotationId: string;
  totalAmount: number;
  submittedAt: string;
};

type PortalApiOpenResult = {
  status: 'open';
  rfq: Omit<SupplierPortalRfq, 'status'>;
};

type PortalApiStatusResult = {
  status: 'closed' | 'expired';
};

async function readErrorMessage(response: Response) {
  const payload = await response.json().catch(() => null);

  if (payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  const fallbackText = await response.text().catch(() => '');
  return fallbackText || `Request failed with status ${response.status}`;
}

async function portalFetch(path: string, init?: RequestInit) {
  const baseUrl = getBaseUrl();

  return fetch(`${baseUrl}${path}`, {
    ...init,
    cache: 'no-store',
  });
}

export async function getSupplierPortalRfqAction(token: string): Promise<SupplierPortalLoadResult> {
  if (!token) {
    return { status: 'invalid' };
  }

  const response = await portalFetch(`/api/rfq-portal/${token}`, { method: 'GET' });

  if (response.status === 404) {
    return { status: 'invalid' };
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as PortalApiOpenResult | PortalApiStatusResult;

  if (payload.status === 'expired' || payload.status === 'closed') {
    return { status: payload.status };
  }

  return {
    status: 'open',
    rfq: {
      ...payload.rfq,
      status: 'open',
      attachments: payload.rfq.attachments ?? [],
      submittedQuotation: payload.rfq.submittedQuotation ?? null,
    },
  };
}

export async function submitSupplierPortalQuotationAction(
  token: string,
  payload: SupplierPortalQuotationPayload,
): Promise<SupplierPortalQuotationSubmitResult> {
  const response = await portalFetch(`/api/rfq-portal/${token}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const json = (await response.json()) as { data: SupplierPortalQuotationSubmitResult };
  return json.data;
}

export async function uploadSupplierPortalAttachmentAction(
  token: string,
  file: File,
): Promise<SupplierPortalUploadedAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await portalFetch(`/api/rfq-portal/${token}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const json = (await response.json()) as { data: SupplierPortalUploadedAttachment };
  return json.data;
}
