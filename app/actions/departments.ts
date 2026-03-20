'use server';

import { cookies } from 'next/headers';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';
import type { Department } from '@/lib/api';

export async function getDepartmentsAction(branchId: string): Promise<Department[]> {
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) throw new Error('Unauthorized');

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${baseUrl}/api/departments?branchId=${branchId}`, {
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
    });

    if (!res.ok) throw new Error(`Failed to fetch departments: ${res.statusText}`);
    const data = await res.json();
    return data.data ?? data;
}

export async function createDepartmentAction(branchId: string, name: string): Promise<Department> {
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message) throw new Error('Unauthorized');

    const allowed = await hasPermission(user as AuthenticatedUser, 'inventory.manage'); // Assuming a permission, can adjust if needed
    if (!allowed) throw new Error('Forbidden: Insufficient permissions');

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${baseUrl}/api/departments`, {
        method: 'POST',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ branchId, name })
    });

    if (!res.ok) throw new Error(`Failed to create department: ${res.statusText}`);
    return await res.json();
}
