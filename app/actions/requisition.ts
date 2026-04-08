'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type { 
    CreateRequisitionPayload, 
    Requisition, 
    RequisitionFilters, 
    PaginatedResponse,
    RequisitionStatus
} from '@/lib/api';

async function getSessionUser(): Promise<AuthenticatedUser> {
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) throw new Error('Unauthorized');
    const authed = user as AuthenticatedUser;
    if (!authed.organizationId) throw new Error('Unauthorized: missing organizationId');
    return authed;
}

async function getCookieHeader(): Promise<string> {
    const cookieStore = await cookies();
    return cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
}

/**
 * createRequisitionAction
 * POST /api/requisitions
 */
export async function createRequisitionAction(
    payload: CreateRequisitionPayload
): Promise<Requisition> {
    if (!payload.branchId || !payload.departmentId || !payload.items || payload.items.length === 0) {
        throw new Error('Invalid requisition payload: branchId, departmentId, and items are required');
    }

    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/requisitions`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        // Override organizationId with session value to prevent spoofing
        body: JSON.stringify({ ...payload, organizationId: user.organizationId })
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('[Action: createRequisitionAction] Failed:', errorText);
        throw new Error(`Failed to create requisition: ${res.statusText}`);
    }

    const json = (await res.json()) as { data: Requisition };
    console.log(`[AUDIT] User ${user.id} created requisition`);
    return json.data;
}

/**
 * getRequisitionsAction
 * GET /api/requisitions
 */
export async function getRequisitionsAction(
    branchId: string,
    params: RequisitionFilters = {}
): Promise<PaginatedResponse<Requisition>> {
    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();

    const query = new URLSearchParams({
        branchId,
        organizationId: user.organizationId!,
        ...(params.status && params.status !== 'All' ? { status: params.status.toLowerCase() } : {}),
        ...(params.search ? { search: params.search } : {}),
        ...(params.departmentId ? { departmentId: params.departmentId } : {}),
        ...(params.page !== undefined ? { page: String(params.page) } : {}),
        ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
    });

    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/requisitions?${query}`, {
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
    });

    if (!res.ok) throw new Error(`Failed to fetch requisitions: ${res.statusText}`);
    return await res.json();
}

/**
 * getRequisitionAction
 * GET /api/requisitions/{id}
 */
export async function getRequisitionAction(id: string): Promise<Requisition> {
    await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/requisitions/${id}`, {
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
    });

    if (!res.ok) throw new Error(`Failed to fetch requisition: ${res.statusText}`);
    const json = (await res.json()) as { data: Requisition };
    return json.data;
}

/**
 * updateRequisitionStatusAction
 * PATCH /api/requisitions/{id}/status
 */
export async function updateRequisitionStatusAction(
    id: string,
    status: RequisitionStatus
): Promise<Requisition> {
    await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/requisitions/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
    const json = (await res.json()) as { data: Requisition };
    return json.data;
}
