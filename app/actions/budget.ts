'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/rbac/utils';
import type {
  BudgetRow,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '@/lib/api';

async function budgetFetch(
  path: string,
  options: RequestInit,
  permission: string,
): Promise<Response> {
  const user = await getAuthenticatedUser();
  if (!user || (user as AuthenticatedError).message) {
    throw new Error('Unauthorized');
  }
  const allowed = await hasPermission(user as AuthenticatedUser, permission);
  if (!allowed) {
    throw new Error('Forbidden: insufficient permissions');
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
  const res = await budgetFetch(`/api/budgets?${q}`, { method: 'GET' }, 'budgets.read');
  if (!res.ok) {
    throw new Error(`Failed to list budgets: ${res.statusText}`);
  }
  const json = (await res.json()) as { data: BudgetRow[] };
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
    'budgets.create',
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
    'budgets.update',
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json();
}

export async function deleteBudgetAction(id: string): Promise<void> {
  const res = await budgetFetch(`/api/budgets/${id}`, { method: 'DELETE' }, 'budgets.delete');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
}
