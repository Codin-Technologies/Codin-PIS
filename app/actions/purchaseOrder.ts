'use server';

import { cookies } from 'next/headers';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';
import type { POFilters, PaginatedResponse, PurchaseOrder } from '@/lib/api';

export async function listPurchaseOrders(
    branchId: string,
    params: POFilters = {}
): Promise<PaginatedResponse<PurchaseOrder>> {
    // 1. Input Validation
    if (!branchId) {
        throw new Error('Branch ID is required');
    }

    // 2. Authentication Check
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) {
        throw new Error('Unauthorized');
    }

    // 3. Role-Based Access Check
    // Depending on schema, check valid permission. If 'purchase_orders.read' doesn't exist, this fails securely.
    // For this example, we assume `purchase_orders.read` is the correct permission node.
    const allowed = await hasPermission(user as AuthenticatedUser, 'purchase_orders.read');
    if (!allowed) {
        throw new Error('Forbidden: Insufficient permissions to read purchase orders');
    }

    // 4. Call backend using server-side environment variables
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    
    const query = new URLSearchParams({ branchId });
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.pageSize !== undefined) query.append('pageSize', String(params.pageSize));

    // Forward cookies so the backend API can also identify the session
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

    const data = await res.json();
    return data;
}
