import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    fetchInventory,
    createInventoryItem,
    type InventoryFilters,
    type CreateInventoryItemPayload,
} from '@/lib/api';

/**
 * useInventory — paginated inventory query.
 * Filter params (dept, search, status) are included in the query key
 * so each unique filter combination gets its own cache entry.
 *
 * NOTE: No optimistic stock recalculation. The backend is the source
 * of truth for quantities; we refetch after mutations.
 */
export function useInventory(branchId: string, filters: InventoryFilters = {}) {
    return useQuery({
        queryKey: queryKeys.inventory(branchId, filters),
        queryFn: () => fetchInventory(branchId, filters),
        enabled: !!branchId,
    });
}

/**
 * useCreateInventoryItem — invalidates the entire inventory list
 * for this branch (all filter variants) on success.
 */
export function useCreateInventoryItem(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateInventoryItemPayload) => createInventoryItem(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', branchId] });
        },
    });
}
