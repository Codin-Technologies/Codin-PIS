import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    getRFQsAction,
    createRFQAction,
    getRFQByIdAction,
    updateRFQStatusAction,
    broadcastRFQAction,
    getRFQQuotationsAction,
} from '@/app/actions/rfq';
import type { RFQFilters, CreateRFQPayload, RfqStatus } from '@/lib/api';

/**
 * useRFQs — paginated list of RFQs.
 */
export function useRFQs(branchId: string, params: RFQFilters = {}) {
    return useQuery({
        queryKey: queryKeys.rfqs(branchId, params),
        queryFn: () => getRFQsAction(branchId, params),
        enabled: !!branchId,
    });
}

/**
 * useCreateRFQ — create a new RFQ from a requisition.
 */
export function useCreateRFQ(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRFQPayload) => createRFQAction(payload),
        onSuccess: (created) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rfqs(branchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.rfq(created.id) });
        },
    });
}

export function useRFQ(id: string | null) {
    return useQuery({
        queryKey: queryKeys.rfq(id || ''),
        queryFn: () => getRFQByIdAction(id as string),
        enabled: !!id,
    });
}

export function useRFQQuotations(
    branchId: string,
    rfqId: string | null,
    params: { page?: number; pageSize?: number; search?: string; status?: string } = {},
) {
    return useQuery({
        queryKey: queryKeys.rfqQuotations(branchId, rfqId || '', params),
        queryFn: () => getRFQQuotationsAction(rfqId as string, params),
        enabled: !!branchId && !!rfqId,
    });
}

export function useUpdateRFQStatus(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: RfqStatus | string }) =>
            updateRFQStatusAction(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rfqs(branchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.rfq(variables.id) });
            queryClient.invalidateQueries({
                queryKey: queryKeys.rfqQuotations(branchId, variables.id),
            });
        },
    });
}

export function useBroadcastRFQ(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (rfqId: string) => broadcastRFQAction(rfqId),
        onSuccess: (_, rfqId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rfqs(branchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.rfq(rfqId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.rfqQuotations(branchId, rfqId) });
        },
    });
}
