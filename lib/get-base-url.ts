/**
 * Get the base URL for API calls in server-side code
 * 
 * On Vercel: uses VERCEL_URL or NEXT_PUBLIC_APP_URL with https
 * On localhost: uses API_BASE_URL or http://localhost:3000
 */
export function getBaseUrl(): string {
  // If explicitly set, use it
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  // In production (Vercel), construct the URL from VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to app URL if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Local development
  return 'http://localhost:3000';
}

/** User-facing web app URL (login links in emails). Prefer APP_URL over API_BASE_URL. */
export function getPublicSiteUrl(): string {
  const trim = (s: string) => s.replace(/\/$/, '');
  if (process.env.APP_URL?.trim()) return trim(process.env.APP_URL.trim());
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) return trim(process.env.NEXT_PUBLIC_APP_URL.trim());
  if (process.env.VERCEL_URL?.trim()) return trim(`https://${process.env.VERCEL_URL.trim()}`);
  return 'http://localhost:3000';
}
