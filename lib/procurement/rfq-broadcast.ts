import { randomUUID } from 'crypto';

/** End of UTC day for ISO date string `YYYY-MM-DD`, or +7 days if unparseable. */
export function computeTokenExpiresAt(deadlineText: string | null | undefined): Date {
  if (deadlineText?.trim()) {
    const d = new Date(deadlineText.trim());
    if (!Number.isNaN(d.getTime())) {
      const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
      return end;
    }
  }
  const fallback = new Date();
  fallback.setUTCDate(fallback.getUTCDate() + 7);
  return fallback;
}

/** Digits only for api.whatsapp.com/send?phone= */
export function phoneToWhatsAppParam(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

export function buildWhatsAppLink(phoneDigits: string, message: string): string {
  const text = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${text}`;
}

export function newPortalTokenValue(): string {
  return randomUUID();
}
