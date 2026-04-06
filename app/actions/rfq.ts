'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';
import type { 
    RFQ, 
    RFQListItem, 
    RFQFilters, 
    CreateRFQPayload, 
    PaginatedResponse 
} from '@/lib/api';

/**
 * rfqFetch
 * Common wrapper for RFQ-related fetches in server actions.
 */
async function rfqFetch(
    path: string,
    options: RequestInit,
    permission: string
): Promise<Response> {
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) throw new Error('Unauthorized');

    const allowed = await hasPermission(user as AuthenticatedUser, permission);
    if (!allowed) throw new Error(`Forbidden: Insufficient permissions (${permission})`);

    const baseUrl = getBaseUrl();
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    return fetch(`${baseUrl}${path}`, {
        ...options,
        cache: 'no-store',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });
}

/**
 * getRFQsAction
 * GET /api/rfqs
 */
export async function getRFQsAction(
    branchId: string,
    params: RFQFilters = {}
): Promise<PaginatedResponse<RFQListItem>> {
    if (!branchId) throw new Error('branchId is required');

    const query = new URLSearchParams({
        branchId,
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.page !== undefined ? { page: String(params.page) } : {}),
        ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
    });

    const res = await rfqFetch(`/api/rfqs?${query}`, { method: 'GET' }, 'rfqs.read');
    if (!res.ok) throw new Error(`Failed to fetch RFQs: ${res.statusText}`);
    
    return await res.json();
}

/**
 * createRFQAction
 * POST /api/rfqs
 */
export async function createRFQAction(
    payload: CreateRFQPayload
): Promise<RFQ> {
    const res = await rfqFetch(
        '/api/rfqs', 
        { 
            method: 'POST', 
            body: JSON.stringify(payload) 
        }, 
        'rfqs.create'
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to create RFQ: ${res.statusText}`);
    }

    const json = (await res.json()) as { data: RFQ };
    return json.data;
}
