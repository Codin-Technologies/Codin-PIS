/**
 * lib/api.ts
 * ───────────────────────────────────────────────────────────
 * Single source of truth for all HTTP calls in the PIS frontend.
 * No API calls should exist anywhere else (components, hooks, pages).
 *
 * Pattern: each module exports typed async functions that are consumed
 * by the custom hooks in /hooks/*.ts
 */

// ─── Base Fetcher ─────────────────────────────────────────────────────────────

async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(path, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const message =
            (errorBody as { message?: string }).message ??
            `API Error: ${res.status} ${res.statusText}`;
        throw new Error(message);
    }

    // 204 No Content — return empty object
    if (res.status === 204) return {} as T;

    return res.json() as Promise<T>;
}

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
    [key: string]: unknown;
}


// ─── Requisitions ─────────────────────────────────────────────────────────────

export interface Requisition {
    id: string;
    branchId: string;
    requestedBy: string;
    dept: string;
    subject: string;
    value: number;
    date: string;
    status: 'Pending' | 'Approved' | 'Ordered' | 'Delivered' | 'Rejected' | 'In Review';
    priority: 'Low' | 'Normal' | 'High' | 'Emergency';
    items?: RequisitionItem[];
    notes?: string;
}

export interface RequisitionItem {
    id: string;
    name: string;
    qty: number;
    unit: string;
    estimatedPrice: number;
}

export interface RequisitionFilters extends PaginationParams {
    status?: string;
    search?: string;
    dept?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface CreateRequisitionPayload {
    branchId: string;
    subject: string;
    dept: string;
    priority: string;
    items: Omit<RequisitionItem, 'id'>[];
    notes?: string;
}

export async function fetchRequisitions(
    branchId: string,
    params: RequisitionFilters = {}
): Promise<PaginatedResponse<Requisition>> {
    const query = new URLSearchParams({
        branchId,
        ...(params.status && params.status !== 'All' ? { status: params.status } : {}),
        ...(params.search ? { search: params.search } : {}),
        ...(params.dept ? { dept: params.dept } : {}),
        ...(params.page !== undefined ? { page: String(params.page) } : {}),
        ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
    });
    return apiFetch<PaginatedResponse<Requisition>>(`/api/requisitions?${query}`);
}

export async function fetchRequisitionById(id: string): Promise<Requisition> {
    return apiFetch<Requisition>(`/api/requisitions/${id}`);
}

export async function createRequisition(
    payload: CreateRequisitionPayload
): Promise<Requisition> {
    return apiFetch<Requisition>('/api/requisitions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateRequisitionStatus(
    id: string,
    status: Requisition['status']
): Promise<Requisition> {
    return apiFetch<Requisition>(`/api/requisitions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
}

// ─── Purchase Orders ───────────────────────────────────────────────────────────

export interface PurchaseOrder {
    id: string;
    branchId: string;
    requisitionId?: string;
    supplier: string;
    supplierId: string;
    status: 'Draft' | 'Sent' | 'Confirmed' | 'Received' | 'Cancelled';
    totalValue: number;
    deliveryDate: string;
    createdAt: string;
    items?: POItem[];
}

export interface POItem {
    id: string;
    name: string;
    qty: number;
    unit: string;
    unitPrice: number;
    total: number;
}

export interface POFilters extends PaginationParams {
    status?: string;
    search?: string;
    supplierId?: string;
}

export async function fetchPurchaseOrders(
    branchId: string,
    params: POFilters = {}
): Promise<PaginatedResponse<PurchaseOrder>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<PurchaseOrder>>(`/api/purchase-orders?${query}`);
}

export async function fetchPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    return apiFetch<PurchaseOrder>(`/api/purchase-orders/${id}`);
}

export async function createPurchaseOrder(
    payload: Omit<PurchaseOrder, 'id' | 'createdAt'>
): Promise<PurchaseOrder> {
    return apiFetch<PurchaseOrder>('/api/purchase-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

// ─── GRN (Goods Receiving) ─────────────────────────────────────────────────────

export interface GRN {
    id: string;
    branchId: string;
    poNumber: string;
    purchaseOrderId: string;
    supplier: string;
    supplierId: string;
    receivedDate: string;
    status: 'Fully Received' | 'Partial' | 'Quarantined' | 'Rejected';
    inspection: 'Passed' | 'Failed' | 'In Progress' | 'Pending';
    items: number;
    receivedBy: string;
    notes?: string;
}

export interface GRNFilters extends PaginationParams {
    status?: string;
    purchaseOrderId?: string;
}

export interface CreateGRNPayload {
    branchId: string;
    purchaseOrderId: string;
    items: {
        poItemId: string;
        receivedQty: number;
        inspectionStatus: string;
        notes?: string;
    }[];
    receivedBy: string;
    notes?: string;
}

export async function fetchGRNs(
    branchId: string,
    params: GRNFilters = {}
): Promise<PaginatedResponse<GRN>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<GRN>>(`/api/grns?${query}`);
}

export async function createGRN(payload: CreateGRNPayload): Promise<GRN> {
    return apiFetch<GRN>('/api/grns', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

// ─── Inventory ─────────────────────────────────────────────────────────────────

export interface Department {
    id: string;
    branchId: string;
    name: string;
    createdAt?: string;
}

export interface InventoryAlert {
    id: string;
    inventoryItemId: string;
    name: string;
    message: string;
    severity: 'Low' | 'Critical';
    qty: number;
    unit: string;
    createdAt?: string;
    image?: string;
}

export interface InventoryItem {
    id: string;
    branchId: string;
    name: string;
    sku: string;
    dept: string;
    qty: number;
    unit: string;
    minQty: number;
    status: 'Good' | 'Low' | 'Critical' | 'Out';
    unitCost: number;
    image?: string;
}

export interface InventoryFilters extends PaginationParams {
    dept?: string;
    search?: string;
    status?: string;
}

export interface CreateInventoryItemPayload {
    branchId: string;
    name: string;
    sku: string;
    departmentId: string;
    qty: number;
    unit: string;
    minQty: number;
    unitCost?: number;
}

export async function fetchInventory(
    branchId: string,
    filters: InventoryFilters = {}
): Promise<PaginatedResponse<InventoryItem>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(filters) });
    return apiFetch<PaginatedResponse<InventoryItem>>(`/api/inventory?${query}`);
}

export async function createInventoryItem(
    payload: CreateInventoryItemPayload
): Promise<InventoryItem> {
    return apiFetch<InventoryItem>('/api/inventory', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

// ─── Suppliers ─────────────────────────────────────────────────────────────────

export interface Supplier {
    id: string;
    branchId: string;
    name: string;
    category: string;
    rating: number;
    location: string;
    status: 'Active' | 'Inactive' | 'Under Review';
    reliability: number;
    spend: number;
    contacts: string;
    tags: string[];
    email?: string;
    phone?: string;
}

export interface SupplierFilters extends PaginationParams {
    search?: string;
    category?: string;
    status?: string;
}

export interface CreateSupplierPayload {
    branchId: string;
    name: string;
    category: string;
    location: string;
    contacts: string;
    email?: string;
    phone?: string;
    tags?: string[];
}

export async function fetchSuppliers(
    branchId: string,
    params: SupplierFilters = {}
): Promise<PaginatedResponse<Supplier>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<Supplier>>(`/api/suppliers?${query}`);
}

export async function createSupplier(
    payload: CreateSupplierPayload
): Promise<Supplier> {
    return apiFetch<Supplier>('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

// ─── RFQs ─────────────────────────────────────────────────────────────────────

export interface RFQ {
    id: string;
    branchId: string;
    requisitionId: string;
    title: string;
    status: 'Draft' | 'Sent' | 'Responses Received' | 'Awarded' | 'Cancelled';
    deadline: string;
    createdAt: string;
    responseCount: number;
}

export interface RFQFilters extends PaginationParams {
    status?: string;
    search?: string;
}

export async function fetchRFQs(
    branchId: string,
    params: RFQFilters = {}
): Promise<PaginatedResponse<RFQ>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<RFQ>>(`/api/rfqs?${query}`);
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface ReportFilters {
    dateFrom?: string;
    dateTo?: string;
    dept?: string;
    [key: string]: string | undefined;
}

export async function fetchReport<T = unknown>(
    branchId: string,
    type: string,
    filters: ReportFilters = {}
): Promise<T> {
    const query = new URLSearchParams({ branchId, type, ...flattenParams(filters) });
    return apiFetch<T>(`/api/reports?${query}`);
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export interface AuditLog {
    id: string;
    branchId: string;
    action: string;
    actor: string;
    module: string;
    entityId: string;
    detail: string;
    createdAt: string;
}

export interface AuditLogFilters extends PaginationParams {
    module?: string;
    actor?: string;
    dateFrom?: string;
    dateTo?: string;
}

export async function fetchAuditLogs(
    branchId: string,
    params: AuditLogFilters = {}
): Promise<PaginatedResponse<AuditLog>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<AuditLog>>(`/api/audit-logs?${query}`);
}

// ─── Kitchen Issuances ────────────────────────────────────────────────────────

export interface Issuance {
    id: string;
    branchId: string;
    issuedBy: string;
    issuedTo: string;
    dept: string;
    status: 'Pending' | 'Issued' | 'Cancelled';
    items: IssuanceItem[];
    createdAt: string;
}

export interface IssuanceItem {
    inventoryItemId: string;
    name: string;
    requestedQty: number;
    issuedQty: number;
    unit: string;
}

export interface IssuanceFilters extends PaginationParams {
    dept?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface CreateIssuancePayload {
    branchId: string;
    issuedTo: string;
    dept: string;
    items: Omit<IssuanceItem, 'name'>[];
}

export async function fetchIssuances(
    branchId: string,
    params: IssuanceFilters = {}
): Promise<PaginatedResponse<Issuance>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<Issuance>>(`/api/issuances?${query}`);
}

export async function createIssuance(
    payload: CreateIssuancePayload
): Promise<Issuance> {
    return apiFetch<Issuance>('/api/issuances', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

// ─── Waste & Shrinkage Logs ────────────────────────────────────────────────────

export interface WasteLog {
    id: string;
    branchId: string;
    inventoryItemId: string;
    itemName: string;
    qty: number;
    unit: string;
    reason: string;
    loggedBy: string;
    cost: number;
    createdAt: string;
}

export interface WasteLogFilters extends PaginationParams {
    dateFrom?: string;
    dateTo?: string;
    dept?: string;
}

export async function fetchWasteLogs(
    branchId: string,
    params: WasteLogFilters = {}
): Promise<PaginatedResponse<WasteLog>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<WasteLog>>(`/api/waste-logs?${query}`);
}

// ─── Recipes / Bill of Materials ───────────────────────────────────────────────

export interface Recipe {
    id: string;
    branchId: string;
    name: string;
    category: string;
    servings: number;
    costPerServing: number;
    status: 'Active' | 'Draft' | 'Archived';
    ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
    inventoryItemId: string;
    name: string;
    qty: number;
    unit: string;
    costPerUnit: number;
}

export interface RecipeFilters extends PaginationParams {
    category?: string;
    search?: string;
    status?: string;
}

export async function fetchRecipes(
    branchId: string,
    params: RecipeFilters = {}
): Promise<PaginatedResponse<Recipe>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<Recipe>>(`/api/recipes?${query}`);
}

// ─── Organizations ─────────────────────────────────────────────────────────────

export interface OrganizationType {
    id: string;
    name: string;
    description?: string;
}

export interface Organization {
    id: string;
    name: string;
    organizationTypeId: string;
    organizationType?: OrganizationType;
    location?: string;
    contact?: string;
    users?: { id: string }[];
    createdAt: string;
}

export async function fetchOrganizationTypes(): Promise<OrganizationType[]> {
    const response = await apiFetch<{ data: OrganizationType[] }>('/api/organization-types');
    return response.data;
}

export async function createOrganizationType(name: string): Promise<OrganizationType> {
    return apiFetch<OrganizationType>('/api/organization-types', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}

export async function fetchOrganizations(): Promise<Organization[]> {
    const response = await apiFetch<{ data: Organization[] }>('/api/organizations');
    return response.data;
}

export async function fetchOrganizationById(id: string): Promise<Organization> {
    const response = await apiFetch<{ data: Organization }>(`/api/organizations/${id}`);
    return response.data;
}

export async function createOrganization(payload: Omit<Organization, 'id' | 'createdAt' | 'organizationType' | 'users'>): Promise<Organization> {
    const response = await apiFetch<{ data: Organization }>('/api/organizations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return response.data;
}

export async function updateOrganization(id: string, payload: Partial<Omit<Organization, 'id' | 'createdAt' | 'organizationType' | 'users'>>): Promise<void> {
    return apiFetch<void>(`/api/organizations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export async function deleteOrganization(id: string): Promise<void> {
    return apiFetch<void>(`/api/organizations/${id}`, { method: 'DELETE' });
}

// ─── Permissions & Roles ──────────────────────────────────────────────────────

export interface PermissionGroup {
    id: string;
    name: string;
    description?: string;
    permissions: Permission[];
}

export interface Permission {
    id: string;
    name: string; // e.g. "users.create"
    groupId: string;
    description?: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[]; // Array of permission IDs
    createdAt: string;
}

export async function fetchPermissionGroups(): Promise<PermissionGroup[]> {
    return apiFetch<PermissionGroup[]>('/api/permission-groups');
}

export async function fetchPermissions(): Promise<PermissionGroup[]> {
    return apiFetch<PermissionGroup[]>('/api/permissions');
}

export async function createPermissionGroup(name: string): Promise<PermissionGroup> {
    return apiFetch<PermissionGroup>('/api/permission-groups', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}

export async function createPermission(payload: { name: string; groupId: string }): Promise<Permission> {
    return apiFetch<Permission>('/api/permissions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function fetchRoles(): Promise<Role[]> {
    return apiFetch<Role[]>('/api/roles');
}

export async function fetchRoleById(id: string): Promise<Role> {
    return apiFetch<Role>(`/api/roles/${id}`);
}

export async function createRole(payload: Omit<Role, 'id' | 'createdAt'>): Promise<Role> {
    return apiFetch<Role>('/api/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateRole(id: string, payload: Partial<Role>): Promise<Role> {
    return apiFetch<Role>(`/api/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function deleteRole(id: string): Promise<void> {
    return apiFetch<void>(`/api/roles/${id}`, { method: 'DELETE' });
}


// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    fullName: string;
    email: string;
    roleId: string;
    roleName?: string;
    organizationId: string;
    branchName?: string;
    status: 'Active' | 'Inactive' | 'Pending';
    createdAt: string;
}

export interface CreateUserPayload {
    fullName: string;
    email: string;
    roleId: string;
    organizationId: string;
    password?: string;
}

export async function fetchUsers(): Promise<User[]> {
    const res = await apiFetch<{ data: User[] }>('/api/users');
    return res.data;
}

export async function fetchUserById(id: string): Promise<User> {
    const res = await apiFetch<{ data: User }>(`/api/users/${id}`);
    return res.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
    const res = await apiFetch<{ data: User }>('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function updateUser(id: string, payload: Partial<CreateUserPayload>): Promise<User> {
    const res = await apiFetch<{ data: User }>(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function deleteUser(id: string): Promise<void> {
    return apiFetch<void>(`/api/users/${id}`, { method: 'DELETE' });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function changePassword(payload: { old: string; new: string }): Promise<void> {
    return apiFetch<void>('/api/auth/changepwd', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function resetPassword(payload: { email: string; otp: string; new: string }): Promise<void> {
    return apiFetch<void>('/api/auth/resetpwd', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function sendResetOTP(email: string): Promise<void> {
    return apiFetch<void>('/api/auth/sendotp', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function verifyResetOTP(email: string, otp: string): Promise<{ token: string }> {
    return apiFetch<{ token: string }>('/api/auth/verifyotp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
    });
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Coerce all defined filter values to strings for URLSearchParams */
function flattenParams(params: Record<string, unknown>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, String(v)])
    );
}
