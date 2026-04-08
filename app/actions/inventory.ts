'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type { InventoryItem, InventoryFilters, CreateInventoryItemPayload, InventoryAlert } from '@/lib/api';

interface PaginatedResponse<T> { data: T[]; total: number; page: number; pageSize: number; }

function flattenParams(params: Record<string, unknown>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, String(v)])
    );
}

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

export async function getInventoryItemsAction(branchId: string, filters: InventoryFilters = {}): Promise<PaginatedResponse<InventoryItem>> {
    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const query = new URLSearchParams({ branchId, organizationId: user.organizationId!, ...flattenParams(filters) });
    const res = await fetch(`${baseUrl}/api/inventory?${query}`, {
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
    });

    if (!res.ok) throw new Error(`Failed to fetch inventory items: ${res.statusText}`);
    return await res.json();
}

export async function getInventoryAlertsAction(branchId: string): Promise<InventoryAlert[] | InventoryItem[]> {
    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const query = new URLSearchParams({ branchId, organizationId: user.organizationId! });
    const res = await fetch(`${baseUrl}/api/inventory/alerts?${query}`, {
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch inventory alerts: ${res.statusText}`);
    }
    const data = await res.json();
    return data.data ?? data;
}

export async function createInventoryItemAction(payload: CreateInventoryItemPayload): Promise<InventoryItem> {
    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/inventory`, {
        method: 'POST',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...payload, organizationId: user.organizationId })
    });

    if (!res.ok) throw new Error(`Failed to create inventory item: ${res.statusText}`);
    return await res.json();
}

export async function updateInventoryItemAction(id: string, payload: Partial<CreateInventoryItemPayload>): Promise<InventoryItem> {
    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...payload, organizationId: user.organizationId })
    });

    if (!res.ok) throw new Error(`Failed to update inventory item: ${res.statusText}`);
    return await res.json();
}

export async function deleteInventoryItemAction(id: string): Promise<void> {
    await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookieHeader }
    });

    if (!res.ok) throw new Error(`Failed to delete inventory item: ${res.statusText}`);
}

export async function adjustInventoryQuantityAction(id: string, payload: { qtyDelta: number; reason?: string }): Promise<InventoryItem> {
    await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/inventory/${id}`, {
        method: 'PATCH',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Failed to adjust inventory item quantity: ${res.statusText}`);
    return await res.json();
}

export interface RecordUsagePayload {
    date: string;
    reason: string;
    notes?: string;
    organizationId: string;
    recordedById: string;
    items: {
        inventoryItemId: string;
        qtyUsed: number;
    }[];
}

export interface UsageRecord {
    id: string;
    date: string;
    reason: string;
    notes?: string;
    organizationId: string;
    createdAt: string;
    recordedBy: {
        id: string;
        fullName: string;
        email: string;
    };
    itemsCount: number;
    items: {
        id: string;
        inventoryItemId: string;
        inventoryItemName: string;
        unit: string;
        qtyUsed: number;
    }[];
}

export interface UsageDetail extends Omit<UsageRecord, 'itemsCount'> {
    items: {
        id: string;
        inventoryItemId: string;
        inventoryItemName: string;
        unit: string;
        currentStock: number;
        qtyUsed: number;
    }[];
}

export async function getInventoryUsageAction(branchId: string): Promise<{ data: UsageRecord[]; message: string }> {
    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const query = new URLSearchParams({ branchId, organizationId: user.organizationId! });
    const res = await fetch(`${baseUrl}/api/inventory/usage?${query}`, {
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
    });

    if (!res.ok) throw new Error(`Failed to fetch inventory usage: ${res.statusText}`);
    return await res.json();
}

export async function getInventoryUsageByIdAction(id: string): Promise<{ data: UsageDetail; message: string }> {
    await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/inventory/usage/${id}`, {
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
    });

    if (!res.ok) throw new Error(`Failed to fetch inventory usage detail: ${res.statusText}`);
    return await res.json();
}

export async function recordInventoryUsageAction(payload: RecordUsagePayload): Promise<void> {
    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    // Always override organizationId with the session value
    const securePayload = { ...payload, organizationId: user.organizationId };

    const res = await fetch(`${baseUrl}/api/inventory/usage`, {
        method: 'POST',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(securePayload)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to record inventory usage: ${res.status} ${res.statusText} - ${errorText}`);
    }
}
