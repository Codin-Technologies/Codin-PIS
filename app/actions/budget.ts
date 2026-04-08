'use server';

import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/get-base-url';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';
import type {
  BudgetRow,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '@/lib/api';

async function getSessionUser(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user || (user as AuthenticatedError).message) throw new Error('Unauthorized');
  const authed = user as AuthenticatedUser;
  if (!authed.organizationId) throw new Error('Unauthorized: missing organizationId');
  return authed;
}

async function budgetFetch(
  path: string,
  options: RequestInit,
): Promise<Response> {
  // Session user validated — organizationId injected per-action below
  await getSessionUser();
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
  const user = await getSessionUser();
  const q = new URLSearchParams({ branchId, organizationId: user.organizationId! });
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
  const user = await getSessionUser();
  const { branchId, ...rest } = payload;
  const res = await budgetFetch(
    '/api/budgets',
    {
      method: 'POST',
      body: JSON.stringify({
        ...rest,
        // Always use the session's organizationId, not the client-provided value
        organizationId: user.organizationId,
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
  const user = await getSessionUser();
  // Enforce organizationId from session in update payload
  const res = await budgetFetch(
    `/api/budgets/${id}`,
    { method: 'PUT', body: JSON.stringify({ ...payload, organizationId: user.organizationId }) },
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
