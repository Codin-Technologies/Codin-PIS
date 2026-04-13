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

export type RequisitionStatus =
    | 'pending'
    | 'in_review'
    | 'approved'
    | 'rejected'
    | 'ordered'
    | 'delivered';

export interface RequisitionItem {
    id: string;
    name: string;
    qty: number;
    unit: string;
    estimatedPrice: number;
    inventoryItemId?: string;
}

export interface Requisition {
    id: string;
    requisitionNumber?: string;
    branchId: string;
    organizationId?: string;
    requestedBy: string;
    requestedById?: string;
    departmentId?: string;
    dept: string;
    subject: string;
    value: number;
    date: string;
    status: RequisitionStatus;
    priority: string;
    deliveryDate?: string | null;
    reason?: string | null;
    budgetId?: string | null;
    fiscalYear?: string | null;
    estimatedTotal?: string;
    items?: RequisitionItem[];
    notes?: string;
}

export interface RequisitionFilters extends PaginationParams {
    status?: string;
    search?: string;
    dept?: string;
    departmentId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface CreateRequisitionLinePayload {
    inventoryItemId: string;
    qty: number;
    estimatedUnitPrice?: number;
}

export interface CreateRequisitionPayload {
    branchId: string;
    departmentId: string;
    organizationId?: string;
    budgetId?: string | null;
    fiscalYear?: string | null;
    priority?: string;
    deliveryDate?: string | null;
    reason?: string | null;
    items: CreateRequisitionLinePayload[];
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
        ...(params.departmentId ? { departmentId: params.departmentId } : {}),
        ...(params.page !== undefined ? { page: String(params.page) } : {}),
        ...(params.pageSize !== undefined ? { pageSize: String(params.pageSize) } : {}),
    });
    return apiFetch<PaginatedResponse<Requisition>>(`/api/requisitions?${query}`);
}

export async function fetchRequisitionById(id: string): Promise<Requisition> {
    const res = await apiFetch<{ data: Requisition }>(`/api/requisitions/${id}`);
    return res.data;
}

export async function createRequisition(
    payload: CreateRequisitionPayload
): Promise<Requisition> {
    const res = await apiFetch<{ data: Requisition }>('/api/requisitions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function updateRequisitionStatus(
    id: string,
    status: RequisitionStatus | string
): Promise<Requisition> {
    const res = await apiFetch<{ data: Requisition }>(`/api/requisitions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    return res.data;
}

// ─── Budgets (procurement) ──────────────────────────────────────────────────

export type BudgetHealth = 'on_track' | 'warning' | 'critical';

export interface BudgetRow {
    id: string;
    name: string;
    departmentId: string;
    departmentName: string | null;
    organizationId: string;
    fiscalYear: string;
    allocatedAmount: string;
    notes: string | null;
    createdAt: string;
    spent: number;
    committed: number;
    remaining: number;
    health: BudgetHealth;
}

export interface BudgetFilters {
    departmentId?: string;
    fiscalYear?: string;
}

export async function fetchBudgets(
    branchId: string,
    params: BudgetFilters = {}
): Promise<{ data: BudgetRow[] }> {
    const query = new URLSearchParams({
        branchId,
        ...(params.departmentId ? { departmentId: params.departmentId } : {}),
        ...(params.fiscalYear ? { fiscalYear: params.fiscalYear } : {}),
    });
    return apiFetch<{ data: BudgetRow[] }>(`/api/budgets?${query}`);
}

export async function fetchBudgetById(id: string): Promise<BudgetRow> {
    const res = await apiFetch<{ data: BudgetRow }>(`/api/budgets/${id}`);
    return res.data;
}

export interface CreateBudgetPayload {
    name: string;
    departmentId: string;
    branchId: string;
    organizationId?: string;
    fiscalYear: string;
    amount: number;
    notes?: string | null;
}

export interface UpdateBudgetPayload {
    name?: string;
    departmentId?: string;
    fiscalYear?: string;
    amount?: number;
    notes?: string | null;
    organizationId?: string;
    branchId?: string;
}

export async function createBudget(payload: CreateBudgetPayload): Promise<unknown> {
    const { branchId, organizationId, ...rest } = payload;
    return apiFetch('/api/budgets', {
        method: 'POST',
        body: JSON.stringify({
            ...rest,
            organizationId: organizationId ?? branchId,
            branchId,
        }),
    });
}

export async function updateBudget(id: string, payload: UpdateBudgetPayload): Promise<unknown> {
    return apiFetch(`/api/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function deleteBudget(id: string): Promise<void> {
    await apiFetch(`/api/budgets/${id}`, { method: 'DELETE' });
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

export type SupplierStatus = 'Active' | 'Inactive' | 'Under Review';

export interface Supplier {
    id: string;
    branchId: string;
    organizationId?: string;
    name: string;
    category: string;
    contactPerson?: string | null;
    email?: string;
    phone?: string;
    website?: string;
    vatNumber?: string;
    paymentTerms?: string;
    streetAddress?: string;
    rating: number;
    location: string;
    status: SupplierStatus;
    reliability: number;
    spend: number;
    contacts: string;
    tags: string[];
}

export interface SupplierFilters extends PaginationParams {
    search?: string;
    category?: string;
    status?: string;
}

export interface CreateSupplierPayload {
    branchId: string;
    organizationId?: string;
    name: string;
    category: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    website?: string;
    vatNumber?: string;
    paymentTerms?: string;
    streetAddress?: string;
}

export interface UpdateSupplierPayload {
    name?: string;
    category?: string;
    contactPerson?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    vatNumber?: string | null;
    paymentTerms?: string | null;
    streetAddress?: string | null;
    status?: SupplierStatus | string;
}

export async function fetchSuppliers(
    branchId: string,
    params: SupplierFilters = {}
): Promise<PaginatedResponse<Supplier>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<Supplier>>(`/api/suppliers?${query}`);
}

export async function fetchSupplierById(id: string): Promise<Supplier> {
    const res = await apiFetch<{ data: Supplier }>(`/api/suppliers/${id}`);
    return res.data;
}

export async function createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
    const res = await apiFetch<{ data: Supplier }>('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function updateSupplier(id: string, payload: UpdateSupplierPayload): Promise<Supplier> {
    const res = await apiFetch<{ data: Supplier }>(`/api/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function deleteSupplier(id: string): Promise<void> {
    await apiFetch<{ message: string }>(`/api/suppliers/${id}`, { method: 'DELETE' });
}

// ─── RFQs ─────────────────────────────────────────────────────────────────────

export type RfqStatus = 'draft' | 'sent' | 'evaluating' | 'awarded' | 'cancelled';

export interface RfqSupplierRef {
    id: string;
    name: string;
    category: string;
    email: string | null;
    phone: string | null;
    website?: string | null;
}

export interface RFQListItem {
    id: string;
    branchId: string;
    organizationId: string;
    rfqNumber: string;
    requisitionId: string;
    title: string;
    category: string | null;
    paymentTerms: string | null;
    requiredDelivery: string | null;
    deadline: string | null;
    description?: string | null;
    terms?: string | null;
    status: RfqStatus | string;
    createdAt: string;
    createdById: string;
    createdByName: string | null;
    responseCount: number;
    supplierIds: string[];
}

export interface RFQ extends RFQListItem {
    suppliers: RfqSupplierRef[];
    items: RequisitionItem[];
}

export interface RFQFilters extends PaginationParams {
    status?: string;
    search?: string;
}

export interface CreateRFQPayload {
    branchId: string;
    organizationId?: string;
    requisitionId: string;
    title: string;
    category?: string;
    paymentTerms?: string;
    requiredDelivery?: string;
    deadline?: string;
    supplierIds?: string[];
    description?: string;
    terms?: string;
}

export async function fetchRFQs(
    branchId: string,
    params: RFQFilters = {}
): Promise<PaginatedResponse<RFQListItem>> {
    const query = new URLSearchParams({ branchId, ...flattenParams(params) });
    return apiFetch<PaginatedResponse<RFQListItem>>(`/api/rfqs?${query}`);
}

export async function fetchRFQById(id: string): Promise<RFQ> {
    const res = await apiFetch<{ data: RFQ }>(`/api/rfqs/${id}`);
    return res.data;
}

export async function createRFQ(payload: CreateRFQPayload): Promise<RFQ> {
    const res = await apiFetch<{ data: RFQ }>('/api/rfqs', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function updateRFQStatus(id: string, status: RfqStatus | string): Promise<{ id: string; status: string }> {
    const res = await apiFetch<{ data: { id: string; status: string } }>(`/api/rfqs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    return res.data;
}

export interface BroadcastResult {
    supplierId: string;
    name: string;
    email: string | null;
    emailSent: boolean;
    emailError?: string;
    phone: string | null;
    whatsappLink: string | null;
    portalLink: string;
}

export async function broadcastRFQ(rfqId: string): Promise<{ data: BroadcastResult[] }> {
    return apiFetch<{ data: BroadcastResult[] }>(`/api/rfqs/${rfqId}/broadcast`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
}

export interface RFQQuotationItemRow {
    requisitionItemId: string;
    name: string;
    qty: number;
    unitPrice: number;
    leadTime: string;
    remarks: string | null;
}

export interface RFQQuotationAttachmentRow {
    fileName: string;
    fileUrl: string;
    fileSize: string | null;
}

export interface RFQQuotation {
    id: string;
    supplierId: string;
    supplierName: string;
    currency: string;
    totalAmount: number | null;
    validityDate: string;
    paymentTerms: string;
    incoterms: string;
    notes: string | null;
    submittedAt: string | null;
    status: string;
    items: RFQQuotationItemRow[];
    attachments: RFQQuotationAttachmentRow[];
}

export async function fetchRFQQuotations(rfqId: string): Promise<{ data: RFQQuotation[] }> {
    return apiFetch<{ data: RFQQuotation[] }>(`/api/rfqs/${rfqId}/quotations`);
}

export interface SupplierQuotationSummary {
    id: string;
    rfqId: string;
    rfqNumber: string;
    rfqTitle: string;
    currency: string;
    totalAmount: number | null;
    paymentTerms: string;
    submittedAt: string | null;
    status: string;
}

export async function fetchSupplierQuotations(supplierId: string): Promise<{ data: SupplierQuotationSummary[] }> {
    return apiFetch<{ data: SupplierQuotationSummary[] }>(`/api/suppliers/${supplierId}/quotations`);
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

// ─── Kitchen Production ────────────────────────────────────────────────────────
export interface ProductionPlan {
    id: string;
    branchId: string;
    dishName: string;
    targetServings: number;
    estimatedStartTime: string;
    status: 'Planned' | 'In Prep' | 'Completed' | 'Cancelled';
    inventoryStatus: 'Pending' | 'Deducted';
    ingredients: ProductionPlanIngredient[];
    createdAt: string;
}

export interface ProductionPlanIngredient {
    inventoryItemId: string;
    name?: string;
    qty: number;
    unit?: string;
}

export interface CreateProductionPlanPayload {
    dishName: string;
    targetServings: number;
    estimatedStartTime: string;
    ingredients: ProductionPlanIngredient[];
}

export async function fetchProductionPlans(
    branchId: string
): Promise<PaginatedResponse<ProductionPlan>> {
    const query = new URLSearchParams({ branchId });
    return apiFetch<PaginatedResponse<ProductionPlan>>(`/api/kitchen/production?${query}`);
}

export async function createProductionPlan(
    payload: CreateProductionPlanPayload
): Promise<ProductionPlan> {
    return apiFetch<ProductionPlan>('/api/kitchen/production', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateProductionPlanStatus(
    id: string,
    status: ProductionPlan['status']
): Promise<ProductionPlan> {
    return apiFetch<ProductionPlan>(`/api/kitchen/production/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
}

export interface DeductionPayload {
    ingredients: {
        inventoryItemId: string;
        qty: number;
    }[];
}

export async function deductProductionInventory(
    id: string,
    payload?: DeductionPayload
): Promise<void> {
    return apiFetch<void>(`/api/kitchen/production/${id}/deduct`, {
        method: 'POST',
        headers: payload ? { 'Content-Type': 'application/json' } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
    });
}

// ─── Special Orders ────────────────────────────────────────────────────────────

export interface SpecialOrder {
    id: string;
    branchId: string;
    requestName: string;
    preparationNotes: string;
    priorityLevel: 'Normal' | 'High' | 'Critical';
    status: 'Pending' | 'In Progress' | 'Cooked' | 'Delivered' | 'Cancelled';
    logTime: string;
    createdAt: string;
}

export interface CreateSpecialOrderPayload {
    requestName: string;
    preparationNotes: string;
    priorityLevel: string;
    logTime: string;
}

export async function fetchSpecialOrders(
    branchId: string
): Promise<PaginatedResponse<SpecialOrder>> {
    const query = new URLSearchParams({ branchId });
    return apiFetch<PaginatedResponse<SpecialOrder>>(`/api/kitchen/special-orders?${query}`);
}

export async function createSpecialOrder(
    payload: CreateSpecialOrderPayload
): Promise<SpecialOrder> {
    return apiFetch<SpecialOrder>('/api/kitchen/special-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateSpecialOrderStatus(
    id: string,
    status: SpecialOrder['status']
): Promise<SpecialOrder> {
    return apiFetch<SpecialOrder>(`/api/kitchen/special-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
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
    currency: string;
    currencyDisplay: 'symbol' | 'code';
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
    loginAt?: string;
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
