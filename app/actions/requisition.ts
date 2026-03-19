'use server';

import { cookies } from 'next/headers';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';
import type { CreateRequisitionPayload, Requisition } from '@/lib/api';

export async function createRequisitionAction(
    payload: CreateRequisitionPayload
): Promise<Requisition> {
    // 1. Input Validation
    if (!payload.branchId || !payload.subject || !payload.items || payload.items.length === 0) {
        throw new Error('Invalid requisition payload');
    }

    // 2. Authentication Check
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) {
        throw new Error('Unauthorized');
    }

    // 3. Role-Based Access Check
    const allowed = await hasPermission(user as AuthenticatedUser, 'requisitions.create');
    if (!allowed) {
        throw new Error('Forbidden: Insufficient permissions to create requisitions');
    }

    // 4. Call backend using server-side environment variables
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${baseUrl}/api/requisitions`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('[Action: createRequisitionAction] Failed:', errorText);
        throw new Error(`Failed to create requisition: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Log write operation for audit purposes as requested
    console.log(`[AUDIT] User ${(user as AuthenticatedUser).id} created requisition for branch ${payload.branchId}`);

    return data;
}
