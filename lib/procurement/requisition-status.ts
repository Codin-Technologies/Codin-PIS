const ALLOWED = new Set([
  'pending',
  'in_review',
  'approved',
  'rejected',
  'ordered',
  'delivered',
]);

/** Normalize UI / API status strings to DB values */
export function normalizeRequisitionStatus(input: string): string | null {
  const s = input.trim().toLowerCase().replace(/\s+/g, '_');
  if (ALLOWED.has(s)) return s;
  return null;
}

export function isAllowedRequisitionStatus(s: string): boolean {
  return ALLOWED.has(s);
}

export const REQUISITION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  ordered: 'Ordered',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

export function requisitionStatusLabel(status: string): string {
  return REQUISITION_STATUS_LABELS[status] ?? status;
}
