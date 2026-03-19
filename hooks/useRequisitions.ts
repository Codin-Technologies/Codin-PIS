/**
 * hooks/useRequisitions.ts
 * ────────────────────────────────────────────────────────────
 * FULL EXAMPLE MODULE — demonstrates the complete pattern:
 *  - useQuery for list (pagination + filters)
 *  - useMutation for create, status update
 *  - Cache invalidation on success (list only, not unrelated queries)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    fetchRequisitions,
    fetchRequisitionById,
    updateRequisitionStatus,
    type RequisitionFilters,
    type CreateRequisitionPayload,
    type Requisition,
} from '@/lib/api';
import { createRequisitionAction } from '@/app/actions/requisition';

/**
 * useRequisitions — paginated + filtered list query.
 * Query key includes branchId + all filters so switching filters
 * fetches fresh data without polluting the other filter's cache.
 */
export function useRequisitions(branchId: string, params: RequisitionFilters = {}) {
    return useQuery({
        queryKey: queryKeys.requisitions(branchId, params),
        queryFn: () => fetchRequisitions(branchId, params),
        enabled: !!branchId,
    });
}

/**
 * useRequisition — single requisition detail query.
 */
export function useRequisition(id: string) {
    return useQuery({
        queryKey: queryKeys.requisition(id),
        queryFn: () => fetchRequisitionById(id),
        enabled: !!id,
    });
}

/**
 * useCreateRequisition — mutation that invalidates the requisitions list
 * for the relevant branch after a successful create.
 *
 * IMPORTANT: We only invalidate `requisitions` — not inventory, POs, etc.
 * Backend drives all downstream side effects (stock reservations, approvals).
 */
export function useCreateRequisition(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRequisitionPayload) => createRequisitionAction(payload),
        onSuccess: () => {
            // Invalidate ALL parameter variants of this branch's requisitions list.
            // Partial match on ['requisitions', branchId] covers every filter combo.
            queryClient.invalidateQueries({
                queryKey: ['requisitions', branchId],
            });
        },
    });
}

/**
 * useUpdateRequisitionStatus — mutation for status changes (approve, reject, etc.)
 * Invalidates both the list and the specific item's detail query.
 *
 * NOTE: No approval logic runs here. The backend is responsible for
 * workflow transitions; we only send the intended status and invalidate.
 */
export function useUpdateRequisitionStatus(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: Requisition['status'] }) =>
            updateRequisitionStatus(id, status),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['requisitions', branchId] });
            queryClient.invalidateQueries({ queryKey: queryKeys.requisition(id) });
        },
    });
}
