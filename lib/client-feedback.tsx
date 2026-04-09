'use client';

import { toast } from 'sonner';
import { SupportErrorToast } from '@/components/ui/SupportErrorToast';

export const SUPPORT_EMAIL = 'support@codin.co.tz';

export function showSupportErrorToast(options?: { title?: string }) {
  const title = options?.title ?? 'Something went wrong';
  toast.custom((t) => (
    <SupportErrorToast title={title} supportEmail={SUPPORT_EMAIL} onClose={() => toast.dismiss(t)} />
  ));
}

export function notifySupportError(error: unknown, options?: { title?: string }) {
  // Keep the raw error out of the UI, but log it for developers.
  console.error(error);
  showSupportErrorToast(options);
}

