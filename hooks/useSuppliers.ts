import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    fetchSuppliers,
    createSupplier,
    type SupplierFilters,
    type CreateSupplierPayload,
} from '@/lib/api';

const SUPPLIER_STALE_TIME = 10 * 60 * 1000; // 10 minutes — suppliers change infrequently

/**
 * useSuppliers — cached supplier list with extended staleTime.
 * Suppliers are relatively static data; 10-minute cache avoids
 * unnecessary refetches as the user navigates.
 */
export function useSuppliers(branchId: string, params: SupplierFilters = {}) {
    return useQuery({
        queryKey: queryKeys.suppliers(branchId, params),
        queryFn: () => fetchSuppliers(branchId, params),
        enabled: !!branchId,
        staleTime: SUPPLIER_STALE_TIME,
    });
}

export function useCreateSupplier(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSupplierPayload) => createSupplier(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers', branchId] });
        },
    });
}
