'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type { 
    RFQ, 
    RFQListItem, 
    RFQFilters, 
    CreateRFQPayload, 
    PaginatedResponse,
    RFQQuotation,
    RfqStatus,
    BroadcastResult,
} from '@/lib/api';

async function getSessionUser(): Promise<AuthenticatedUser> {
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) throw new Error('Unauthorized');
    const authed = user as AuthenticatedUser;
    if (!authed.organizationId) throw new Error('Unauthorized: missing organizationId');
    return authed;
}

/**
 * rfqFetch
 * Common wrapper for RFQ-related fetches in server actions.
 * Automatically injects the session organizationId into request headers.
 */
async function rfqFetch(
    path: string,
    options: RequestInit,
    organizationId: string,
): Promise<Response> {
    const baseUrl = getBaseUrl();
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    return fetch(`${baseUrl}${path}`, {
        ...options,
        cache: 'no-store',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json',
            'X-Organization-Id': organizationId,
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
    const user = await getSessionUser();

    const query = new URLSearchParams({
        branchId,
        organizationId: user.organizationId!,
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.page !== undefined ? { page: String(params.page) } : {}),
        ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
    });

    const res = await rfqFetch(`/api/rfqs?${query}`, { method: 'GET' }, user.organizationId!);
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
    const user = await getSessionUser();

    const res = await rfqFetch(
        '/api/rfqs', 
        { 
            method: 'POST', 
            // Override organizationId with session value
            body: JSON.stringify({ ...payload, organizationId: user.organizationId })
        }, 
        user.organizationId!,
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to create RFQ: ${res.statusText}`);
    }

    const json = (await res.json()) as { data: RFQ };
    return json.data;
}

/**
 * getRFQByIdAction
 * GET /api/rfqs/{id}
 */
export async function getRFQByIdAction(id: string): Promise<RFQ> {
    if (!id) throw new Error('rfq id is required');
    const user = await getSessionUser();

    const res = await rfqFetch(`/api/rfqs/${id}`, { method: 'GET' }, user.organizationId!);
    if (!res.ok) throw new Error(`Failed to fetch RFQ: ${res.statusText}`);

    const json = (await res.json()) as { data: RFQ };
    return json.data;
}

/**
 * updateRFQStatusAction
 * PATCH /api/rfqs/{id}/status
 */
export async function updateRFQStatusAction(
    id: string,
    status: RfqStatus | string,
): Promise<{ id: string; status: string; updatedAt?: string }> {
    if (!id) throw new Error('rfq id is required');
    const user = await getSessionUser();

    const res = await rfqFetch(
        `/api/rfqs/${id}/status`,
        {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        },
        user.organizationId!,
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to update RFQ status: ${res.statusText}`);
    }

    const json = (await res.json()) as { data: { id: string; status: string; updatedAt?: string } };
    return json.data;
}

/**
 * broadcastRFQAction
 * POST /api/rfqs/{id}/broadcast
 */
export async function broadcastRFQAction(rfqId: string): Promise<BroadcastResult[]> {
    if (!rfqId) throw new Error('rfq id is required');
    const user = await getSessionUser();

    const res = await rfqFetch(
        `/api/rfqs/${rfqId}/broadcast`,
        {
            method: 'POST',
            body: JSON.stringify({}),
        },
        user.organizationId!,
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to broadcast RFQ: ${res.statusText}`);
    }

    const json = (await res.json()) as { data: BroadcastResult[] };
    return json.data;
}

/**
 * getRFQQuotationsAction
 * GET /api/rfqs/{id}/quotations
 */
export async function getRFQQuotationsAction(
    rfqId: string,
    params: { page?: number; pageSize?: number; search?: string; status?: string } = {},
): Promise<{ data: RFQQuotation[] }> {
    if (!rfqId) throw new Error('rfq id is required');
    const user = await getSessionUser();

    const query = new URLSearchParams({
        ...(params.page !== undefined ? { page: String(params.page) } : {}),
        ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {}),
    });
    const url = query.toString()
        ? `/api/rfqs/${rfqId}/quotations?${query.toString()}`
        : `/api/rfqs/${rfqId}/quotations`;

    const res = await rfqFetch(url, { method: 'GET' }, user.organizationId!);
    if (!res.ok) throw new Error(`Failed to fetch RFQ quotations: ${res.statusText}`);

    return (await res.json()) as { data: RFQQuotation[] };
}
