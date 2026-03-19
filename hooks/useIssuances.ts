import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    fetchIssuances,
    createIssuance,
    type IssuanceFilters,
    type CreateIssuancePayload,
} from '@/lib/api';

export function useIssuances(branchId: string, params: IssuanceFilters = {}) {
    return useQuery({
        queryKey: queryKeys.issuances(branchId, params),
        queryFn: () => fetchIssuances(branchId, params),
        enabled: !!branchId,
    });
}

export function useCreateIssuance(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateIssuancePayload) => createIssuance(payload),
        onSuccess: () => {
            // Creating an issuance moves stock from inventory to kitchen
            queryClient.invalidateQueries({ queryKey: ['issuances', branchId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', branchId] });
        },
    });
}
