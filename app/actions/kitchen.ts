'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type { 
    CreateProductionPlanPayload, 
    CreateSpecialOrderPayload, 
    ProductionPlan, 
    SpecialOrder,
    DeductionPayload
} from '@/lib/api';

async function getRequestConfig() {
    const userResult = await getAuthenticatedUser();
    if (!userResult || (userResult as AuthenticatedError).message) throw new Error('Unauthorized');

    const user = userResult as AuthenticatedUser;
    const baseUrl = getBaseUrl();
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    return { baseUrl, cookieHeader, user };
}

export async function getProductionPlansAction(branchId: string) {
    try {
        const { baseUrl, cookieHeader, user } = await getRequestConfig();
        const query = new URLSearchParams({ branchId, organizationId: user.organizationId ?? '' });
        const res = await fetch(`${baseUrl}/api/kitchen/production?${query}`, {
            method: 'GET',
            headers: { 'Cookie': cookieHeader }
        });

        if (!res.ok) throw new Error(`Failed to fetch production plans: ${res.statusText}`);
        return await res.json();
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch production plans');
    }
}

export async function createProductionPlanAction(payload: CreateProductionPlanPayload) {
    try {
        const { baseUrl, cookieHeader } = await getRequestConfig();
        const res = await fetch(`${baseUrl}/api/kitchen/production`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`Failed to create production plan: ${res.statusText}`);
        
        const result = await res.json();
        revalidatePath('/kitchen');
        revalidatePath('/inventory');
        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to create production plan');
    }
}

export async function updateProductionPlanStatusAction(id: string, status: ProductionPlan['status']) {
    try {
        const { baseUrl, cookieHeader } = await getRequestConfig();
        const res = await fetch(`${baseUrl}/api/kitchen/production/${id}`, {
            method: 'PATCH',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!res.ok) throw new Error(`Failed to update production plan status: ${res.statusText}`);

        const result = await res.json();
        revalidatePath('/kitchen');
        revalidatePath('/inventory');
        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update production plan status');
    }
}

export async function deductProductionInventoryAction(id: string, payload?: DeductionPayload) {
    try {
        const { baseUrl, cookieHeader, user } = await getRequestConfig();
        
        // 1. Execute Deduction
        const deductRes = await fetch(`${baseUrl}/api/kitchen/production/${id}/deduct`, {
            method: 'POST',
            headers: { 
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
            },
            body: payload ? JSON.stringify(payload) : undefined
        });

        if (!deductRes.ok) {
            const errorText = await deductRes.text();
            throw new Error(`Failed to deduct inventory: ${deductRes.statusText} - ${errorText}`);
        }

        const result = await deductRes.json();

        // 2. Record Usage if payload exists
        if (payload && payload.ingredients.length > 0) {
            const usagePayload = {
                date: new Date().toISOString().split('T')[0],
                reason: 'Consumption',
                notes: `Kitchen Production: Automated deduction for Production Plan #${id}`,
                organizationId: user.organizationId,
                recordedById: user.id,
                items: payload.ingredients.map(ing => ({
                    inventoryItemId: ing.inventoryItemId,
                    qtyUsed: ing.qty
                }))
            };

            const usageRes = await fetch(`${baseUrl}/api/inventory/usage`, {
                method: 'POST',
                headers: {
                    'Cookie': cookieHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usagePayload)
            });

            if (!usageRes.ok) {
                const errorText = await usageRes.text();
                throw new Error(`Failed to record inventory usage: ${usageRes.statusText} - ${errorText}`);
            }
        }

        revalidatePath('/kitchen');
        revalidatePath('/inventory');
        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to deduct inventory');
    }
}

export async function getSpecialOrdersAction(branchId: string) {
    try {
        const { baseUrl, cookieHeader, user } = await getRequestConfig();
        const query = new URLSearchParams({ branchId, organizationId: user.organizationId ?? '' });
        const res = await fetch(`${baseUrl}/api/kitchen/special-orders?${query}`, {
            method: 'GET',
            headers: { 'Cookie': cookieHeader }
        });

        if (!res.ok) throw new Error(`Failed to fetch special orders: ${res.statusText}`);
        return await res.json();
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch special orders');
    }
}

export async function createSpecialOrderAction(payload: CreateSpecialOrderPayload) {
    try {
        const { baseUrl, cookieHeader } = await getRequestConfig();
        const res = await fetch(`${baseUrl}/api/kitchen/special-orders`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`Failed to create special order: ${res.statusText}`);

        const result = await res.json();
        revalidatePath('/kitchen');
        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to create special order');
    }
}

export async function updateSpecialOrderStatusAction(id: string, status: SpecialOrder['status']) {
    try {
        const { baseUrl, cookieHeader } = await getRequestConfig();
        const res = await fetch(`${baseUrl}/api/kitchen/special-orders/${id}`, {
            method: 'PATCH',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!res.ok) throw new Error(`Failed to update special order status: ${res.statusText}`);

        const result = await res.json();
        revalidatePath('/kitchen');
        return result;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update special order status');
    }
}
