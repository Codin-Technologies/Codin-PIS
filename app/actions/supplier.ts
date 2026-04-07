'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type { 
    Supplier, 
    SupplierFilters, 
    CreateSupplierPayload, 
    PaginatedResponse 
} from '@/lib/api';

/**
 * supplierFetch
 * Common wrapper for supplier-related fetches in server actions.
 */
async function supplierFetch(
    path: string,
    options: RequestInit,
): Promise<Response> {
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) throw new Error('Unauthorized');

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
 * getSuppliersAction
 * GET /api/suppliers
 */
export async function getSuppliersAction(
    branchId: string,
    params: SupplierFilters = {}
): Promise<PaginatedResponse<Supplier>> {
    if (!branchId) throw new Error('branchId is required');

    const query = new URLSearchParams({
        branchId,
        ...(params.search ? { search: params.search } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.page !== undefined ? { page: String(params.page) } : {}),
        ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
    });

    const res = await supplierFetch(`/api/suppliers?${query}`, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to fetch suppliers: ${res.statusText}`);
    
    return await res.json();
}

/**
 * createSupplierAction
 * POST /api/suppliers
 */
export async function createSupplierAction(
    payload: CreateSupplierPayload
): Promise<Supplier> {
    const res = await supplierFetch(
        '/api/suppliers', 
        { 
            method: 'POST', 
            body: JSON.stringify(payload) 
        }, 
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to create supplier: ${res.statusText}`);
    }

    const json = (await res.json()) as { data: Supplier };
    return json.data;
}
