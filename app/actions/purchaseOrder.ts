'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type { POFilters, PaginatedResponse, PurchaseOrder } from '@/lib/api';

async function getSessionUser(): Promise<AuthenticatedUser> {
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) throw new Error('Unauthorized');
    const authed = user as AuthenticatedUser;
    if (!authed.organizationId) throw new Error('Unauthorized: missing organizationId');
    return authed;
}

export async function listPurchaseOrders(
    branchId: string,
    params: POFilters = {}
): Promise<PaginatedResponse<PurchaseOrder>> {
    if (!branchId) {
        throw new Error('Branch ID is required');
    }

    const user = await getSessionUser();

    const baseUrl = getBaseUrl();
    const query = new URLSearchParams({ branchId, organizationId: user.organizationId! });
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.pageSize !== undefined) query.append('pageSize', String(params.pageSize));

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${baseUrl}/api/purchase-orders?${query}`, {
        cache: 'no-store',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Backend Error (${res.status}): ${errorText}`);
    }

    return await res.json();
}
