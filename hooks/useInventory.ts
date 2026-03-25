import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { InventoryFilters, CreateInventoryItemPayload } from '@/lib/api';
import {
    getInventoryItemsAction,
    getInventoryAlertsAction,
    createInventoryItemAction,
    updateInventoryItemAction,
    deleteInventoryItemAction,
    adjustInventoryQuantityAction,
    recordInventoryUsageAction,
    getInventoryUsageAction,
    getInventoryUsageByIdAction,
    type RecordUsagePayload,
    type UsageRecord,
    type UsageDetail
} from '@/app/actions/inventory';

export function useInventory(branchId: string, filters: InventoryFilters = {}) {
    return useQuery({
        queryKey: queryKeys.inventory(branchId, filters),
        queryFn: () => getInventoryItemsAction(branchId, filters),
        enabled: !!branchId,
    });
}

export function useInventoryAlerts(branchId: string) {
    return useQuery({
        // use a custom key here or extend queryKeys in the future
        queryKey: ['inventory', 'alerts', branchId],
        queryFn: () => getInventoryAlertsAction(branchId),
        enabled: !!branchId,
    });
}

export function useCreateInventoryItem(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateInventoryItemPayload) => createInventoryItemAction(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', branchId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts', branchId] });
        },
    });
}

export function useUpdateInventoryItem(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateInventoryItemPayload> }) =>
            updateInventoryItemAction(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', branchId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts', branchId] });
        },
    });
}

export function useDeleteInventoryItem(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteInventoryItemAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', branchId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts', branchId] });
        },
    });
}

export function useAdjustInventoryQuantity(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { qtyDelta: number; reason?: string } }) =>
            adjustInventoryQuantityAction(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', branchId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts', branchId] });
        },
    });
}

export function useInventoryUsage(branchId: string) {
    return useQuery({
        queryKey: queryKeys.inventoryUsage(branchId),
        queryFn: () => getInventoryUsageAction(branchId),
        enabled: !!branchId,
    });
}

export function useInventoryUsageDetail(id: string) {
    return useQuery({
        queryKey: queryKeys.inventoryUsageDetail(id),
        queryFn: () => getInventoryUsageByIdAction(id),
        enabled: !!id,
    });
}

export function useRecordInventoryUsage(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: RecordUsagePayload) => recordInventoryUsageAction(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', branchId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts', branchId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'usage', branchId] });
        },
    });
}
