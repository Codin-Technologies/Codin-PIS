'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type { 
    Supplier, 
    SupplierFilters, 
    CreateSupplierPayload, 
    PaginatedResponse,
    SupplierQuotationSummary,
    UpdateSupplierPayload,
} from '@/lib/api';

async function getSessionUser(): Promise<AuthenticatedUser> {
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) throw new Error('Unauthorized');
    const authed = user as AuthenticatedUser;
    if (!authed.organizationId) throw new Error('Unauthorized: missing organizationId');
    return authed;
}

/**
 * supplierFetch
 * Common wrapper for supplier-related fetches in server actions.
 * Injects the session organizationId to enforce org-level isolation.
 */
async function supplierFetch(
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
 * getSuppliersAction
 * GET /api/suppliers
 */
export async function getSuppliersAction(
    branchId: string,
    params: SupplierFilters = {}
): Promise<PaginatedResponse<Supplier>> {
    if (!branchId) throw new Error('branchId is required');
    const user = await getSessionUser();

    const query = new URLSearchParams({
        branchId,
        organizationId: user.organizationId!,
        ...(params.search ? { search: params.search } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.page !== undefined ? { page: String(params.page) } : {}),
        ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
    });

    const res = await supplierFetch(`/api/suppliers?${query}`, { method: 'GET' }, user.organizationId!);
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
    const user = await getSessionUser();

    const res = await supplierFetch(
        '/api/suppliers', 
        { 
            method: 'POST', 
            // Override organizationId with session value to prevent spoofing
            body: JSON.stringify({ ...payload, organizationId: user.organizationId })
        }, 
        user.organizationId!,
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to create supplier: ${res.statusText}`);
    }

    const json = (await res.json()) as { data: Supplier };
    return json.data;
}

/**
 * getSupplierByIdAction
 * GET /api/suppliers/{id}
 */
export async function getSupplierByIdAction(id: string): Promise<Supplier> {
    if (!id) throw new Error('supplier id is required');
    const user = await getSessionUser();

    const res = await supplierFetch(`/api/suppliers/${id}`, { method: 'GET' }, user.organizationId!);
    if (!res.ok) throw new Error(`Failed to fetch supplier: ${res.statusText}`);

    const json = (await res.json()) as { data: Supplier };
    return json.data;
}

/**
 * updateSupplierAction
 * PUT /api/suppliers/{id}
 */
export async function updateSupplierAction(
    id: string,
    payload: UpdateSupplierPayload,
): Promise<Supplier> {
    if (!id) throw new Error('supplier id is required');
    const user = await getSessionUser();

    const res = await supplierFetch(
        `/api/suppliers/${id}`,
        {
            method: 'PUT',
            body: JSON.stringify(payload),
        },
        user.organizationId!,
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to update supplier: ${res.statusText}`);
    }

    const json = (await res.json()) as { data: Supplier };
    return json.data;
}

/**
 * deleteSupplierAction
 * DELETE /api/suppliers/{id}
 */
export async function deleteSupplierAction(id: string): Promise<void> {
    if (!id) throw new Error('supplier id is required');
    const user = await getSessionUser();

    const res = await supplierFetch(`/api/suppliers/${id}`, { method: 'DELETE' }, user.organizationId!);
    if (!res.ok) throw new Error(`Failed to delete supplier: ${res.statusText}`);
}

/**
 * getSupplierQuotationsAction
 * GET /api/suppliers/{id}/quotations
 */
export async function getSupplierQuotationsAction(
    supplierId: string,
    params: { page?: number; pageSize?: number; search?: string; status?: string } = {},
): Promise<{ data: SupplierQuotationSummary[] }> {
    if (!supplierId) throw new Error('supplier id is required');
    const user = await getSessionUser();

    const query = new URLSearchParams({
        ...(params.page !== undefined ? { page: String(params.page) } : {}),
        ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {}),
    });
    const url = query.toString()
        ? `/api/suppliers/${supplierId}/quotations?${query.toString()}`
        : `/api/suppliers/${supplierId}/quotations`;

    const res = await supplierFetch(url, { method: 'GET' }, user.organizationId!);
    if (!res.ok) throw new Error(`Failed to fetch supplier quotations: ${res.statusText}`);

    return (await res.json()) as { data: SupplierQuotationSummary[] };
}
