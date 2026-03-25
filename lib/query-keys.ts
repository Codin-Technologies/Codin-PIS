export const queryKeys = {
    // ── Procurement & Inventory ──
    requisitions: (branchId: string, params?: object) =>
        ['requisitions', branchId, params] as const,
    requisition: (id: string) => ['requisition', id] as const,

    purchaseOrders: (branchId: string, params?: object) =>
        ['purchaseOrders', branchId, params] as const,
    purchaseOrder: (id: string) => ['purchaseOrder', id] as const,

    grns: (branchId: string, params?: object) =>
        ['grns', branchId, params] as const,

    inventory: (branchId: string, filters?: object) =>
        ['inventory', branchId, filters] as const,

    inventoryUsage: (branchId: string) => ['inventory', 'usage', branchId] as const,
    inventoryUsageDetail: (id: string) => ['inventory', 'usage', 'detail', id] as const,

    suppliers: (branchId: string, params?: object) =>
        ['suppliers', branchId, params] as const,

    rfqs: (branchId: string, params?: object) =>
        ['rfqs', branchId, params] as const,

    reports: (branchId: string, type: string, filters?: object) =>
        ['reports', branchId, type, filters] as const,

    auditLogs: (branchId: string, params?: object) =>
        ['auditLogs', branchId, params] as const,

    issuances: (branchId: string, params?: object) =>
        ['issuances', branchId, params] as const,

    wasteLogs: (branchId: string, params?: object) =>
        ['wasteLogs', branchId, params] as const,

    recipes: (branchId: string, params?: object) =>
        ['recipes', branchId, params] as const,

    // ── Admin & Auth ──
    organizationTypes: () => ['organizationTypes'] as const,
    organizations: () => ['organizations'] as const,
    organization: (id: string) => ['organization', id] as const,

    permissionGroups: () => ['permissionGroups'] as const,
    permissions: () => ['permissions'] as const,

    roles: () => ['roles'] as const,
    role: (id: string) => ['role', id] as const,

    users: () => ['users'] as const,
    user: (id: string) => ['user', id] as const,
};
