const ALLOWED = new Set(['draft', 'sent', 'evaluating', 'awarded', 'cancelled']);

export type RfqStatus = 'draft' | 'sent' | 'evaluating' | 'awarded' | 'cancelled';

export function isAllowedRfqStatus(s: string): s is RfqStatus {
  return ALLOWED.has(s);
}

export function normalizeRfqStatus(input: string): RfqStatus | null {
  const s = input.trim().toLowerCase();
  return isAllowedRfqStatus(s) ? s : null;
}
