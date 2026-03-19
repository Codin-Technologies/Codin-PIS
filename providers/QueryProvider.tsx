'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { makeQueryClient } from '@/lib/query-client';

export function QueryProvider({ children }: { children: ReactNode }) {
    // NOTE: useState ensures we get a stable client instance per component mount.
    // This avoids sharing state between different users/requests on the server.
    const [queryClient] = useState(() => makeQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
