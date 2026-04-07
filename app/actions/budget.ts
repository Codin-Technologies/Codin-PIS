'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type {
  BudgetRow,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '@/lib/api';

async function budgetFetch(
  path: string,
  options: RequestInit,
): Promise<Response> {
  const user = await getAuthenticatedUser();
  if (!user || (user as AuthenticatedError).message) {
    throw new Error('Unauthorized');
  }
  const baseUrl = getBaseUrl();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
  return fetch(`${baseUrl}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      Cookie: cookieHeader,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export async function listBudgetsAction(
  branchId: string,
  params: { departmentId?: string; fiscalYear?: string } = {},
): Promise<BudgetRow[]> {
  if (!branchId) throw new Error('branchId is required');
  const q = new URLSearchParams({ branchId });
  if (params.departmentId) q.set('departmentId', params.departmentId);
  if (params.fiscalYear) q.set('fiscalYear', params.fiscalYear);
  const res = await budgetFetch(`/api/budgets?${q}`, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Failed to list budgets: ${res.statusText}`);
  }
  const json = (await res.json()) as { data: BudgetRow[] };
  return json.data;
}

/**
 * getBudgetAction
 * GET /api/budgets/{id}
 */
export async function getBudgetAction(id: string): Promise<BudgetRow> {
  const res = await budgetFetch(`/api/budgets/${id}`, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Failed to fetch budget ${id}: ${res.statusText}`);
  }
  const json = (await res.json()) as { data: BudgetRow };
  return json.data;
}

export async function createBudgetAction(payload: CreateBudgetPayload): Promise<unknown> {
  const { branchId, organizationId, ...rest } = payload;
  const res = await budgetFetch(
    '/api/budgets',
    {
      method: 'POST',
      body: JSON.stringify({
        ...rest,
        organizationId: organizationId ?? branchId,
        branchId,
      }),
    },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json();
}

export async function updateBudgetAction(id: string, payload: UpdateBudgetPayload): Promise<unknown> {
  const res = await budgetFetch(
    `/api/budgets/${id}`,
    { method: 'PUT', body: JSON.stringify(payload) },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json();
}

export async function deleteBudgetAction(id: string): Promise<void> {
  const res = await budgetFetch(`/api/budgets/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
}
