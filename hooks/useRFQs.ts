import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getRFQsAction, createRFQAction } from '@/app/actions/rfq';
import type { RFQFilters, CreateRFQPayload } from '@/lib/api';

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rfqs', branchId] });
        },
    });
}
