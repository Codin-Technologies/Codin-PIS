'use client';

import { AlertOctagon, Mail, X } from 'lucide-react';

export function SupportErrorToast({
  title = 'Something went wrong',
  supportEmail = 'support@codin.co.tz',
  onClose,
}: {
  title?: string;
  supportEmail?: string;
  onClose?: () => void;
}) {
  return (
    <div className="w-[360px] rounded-2xl border border-white/10 bg-[#17181b] p-4 text-white shadow-2xl shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-300">
              Sorry for encountering this error. Please contact our support via{' '}
              <span className="font-bold text-white">{supportEmail}</span>.
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
              We will make sure this error becomes as rare as possible.
            </p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="font-bold text-white">{supportEmail}</span>
        </div>
        <a
          className="text-xs font-bold text-blue-300 transition-colors hover:text-blue-200"
          href={`mailto:${supportEmail}`}
        >
          Email support
        </a>
      </div>
    </div>
  );
}

