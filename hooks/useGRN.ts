/**
 * hooks/useGRN.ts
 * ────────────────────────────────────────────────────────────
 * DEPENDENT QUERY EXAMPLE — the GRN list is only fetched when
 * a purchaseOrderId is known (i.e., user has scanned/entered a PO).
 *
 * On successful GRN creation, we invalidate:
 *  - GRNs list (direct result)
 *  - Inventory (quantities change after receiving)
 *  - Purchase Orders (status may move to 'Received')
 * Backend drives all stock movements and PO status transitions.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    fetchGRNs,
    createGRN,
    type GRNFilters,
    type CreateGRNPayload,
} from '@/lib/api';

/**
 * useGRNs — dependent query: only fires when purchaseOrderId is provided.
 * This models the UX where a user must first look up a PO before GRNs appear.
 */
export function useGRNs(
    branchId: string,
    params: GRNFilters = {}
) {
    return useQuery({
        queryKey: queryKeys.grns(branchId, params),
        queryFn: () => fetchGRNs(branchId, params),
        // Disable until we have a branchId. If a purchaseOrderId filter is
        // passed, also require it to be truthy before fetching.
        enabled: !!branchId && (params.purchaseOrderId === undefined || !!params.purchaseOrderId),
    });
}

/**
 * useCreateGRN — after a successful goods receipt, invalidate all
 * three affected query domains so the UI stays consistent.
 */
export function useCreateGRN(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateGRNPayload) => createGRN(payload),
        onSuccess: () => {
            // GRNs list reflects the new entry
            queryClient.invalidateQueries({ queryKey: ['grns', branchId] });
            // Inventory quantities are updated by the backend after receiving
            queryClient.invalidateQueries({ queryKey: ['inventory', branchId] });
            // The source PO status may have moved to 'Received'
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders', branchId] });
        },
    });
}
