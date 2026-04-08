'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type { Department } from '@/lib/api';

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

export async function getDepartmentsAction(branchId: string): Promise<Department[]> {
    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    // Use session organizationId to enforce org-level isolation
    const query = new URLSearchParams({ organizationId: user.organizationId!, branchId });
    const res = await fetch(`${baseUrl}/api/departments?${query}`, {
        method: 'GET',
        headers: { 'Cookie': cookieHeader }
    });

    if (!res.ok) throw new Error(`Failed to fetch departments: ${res.statusText}`);
    const data = await res.json();
    return data.data ?? data;
}

export async function createDepartmentAction(branchId: string, name: string): Promise<Department> {
    const user = await getSessionUser();
    const cookieHeader = await getCookieHeader();
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/departments`, {
        method: 'POST',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        // Override organizationId with session value
        body: JSON.stringify({ organizationId: user.organizationId, branchId, name })
    });

    if (!res.ok) throw new Error(`Failed to create department: ${res.statusText}`);
    return await res.json();
}
