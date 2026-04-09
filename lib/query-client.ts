'use client';

import { MutationCache, QueryClient } from '@tanstack/react-query';
import { notifySupportError } from '@/lib/client-feedback';

export function makeQueryClient() {
    return new QueryClient({
        mutationCache: new MutationCache({
            onError: (error, _variables, _context, mutation) => {
                const meta = (mutation.options.meta ?? {}) as {
                    disableGlobalErrorToast?: boolean;
                    errorTitle?: string;
                };

                if (meta.disableGlobalErrorToast) return;

                notifySupportError(error, { title: meta.errorTitle ?? 'Action failed' });
            },
        }),
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 1,
                staleTime: 2 * 60 * 1000, // 2 minutes
            },
        },
    });
}
