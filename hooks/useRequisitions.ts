/**
 * hooks/useRequisitions.ts
 * ────────────────────────────────────────────────────────────
 * Standard requisition hooks using Server Actions.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    type RequisitionFilters,
    type CreateRequisitionPayload,
    type Requisition,
} from '@/lib/api';
import { 
    createRequisitionAction, 
    getRequisitionsAction, 
    getRequisitionAction, 
    updateRequisitionStatusAction 
} from '@/app/actions/requisition';

/**
 * useRequisitions — paginated + filtered list query.
 */
export function useRequisitions(branchId: string, params: RequisitionFilters = {}) {
    return useQuery({
        queryKey: queryKeys.requisitions(branchId, params),
        queryFn: () => getRequisitionsAction(branchId, params),
        enabled: !!branchId,
    });
}

/**
 * useRequisition — single requisition detail query.
 */
export function useRequisition(id: string) {
    return useQuery({
        queryKey: queryKeys.requisition(id),
        queryFn: () => getRequisitionAction(id),
        enabled: !!id,
    });
}

/**
 * useCreateRequisition — mutation for new requisitions.
 */
export function useCreateRequisition(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRequisitionPayload) => createRequisitionAction(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['requisitions'], // Invalidate all lists
            });
        },
    });
}

/**
 * useUpdateRequisitionStatus — mutation for status changes.
 */
export function useUpdateRequisitionStatus(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: Requisition['status'] }) =>
            updateRequisitionStatusAction(id, status),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['requisitions'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.requisition(id) });
        },
    });
}
