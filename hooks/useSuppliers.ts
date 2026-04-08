import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    getSuppliersAction,
    createSupplierAction,
    getSupplierByIdAction,
    updateSupplierAction,
    deleteSupplierAction,
    getSupplierQuotationsAction,
} from '@/app/actions/supplier';
import type {
    SupplierFilters,
    CreateSupplierPayload,
    UpdateSupplierPayload,
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
        queryFn: () => getSuppliersAction(branchId, params),
        enabled: !!branchId,
        staleTime: SUPPLIER_STALE_TIME,
    });
}

export function useCreateSupplier(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSupplierPayload) => createSupplierAction(payload),
        onSuccess: (created) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.suppliers(branchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.supplier(created.id) });
        },
    });
}

export function useSupplier(id: string | null) {
    return useQuery({
        queryKey: queryKeys.supplier(id || ''),
        queryFn: () => getSupplierByIdAction(id as string),
        enabled: !!id,
        staleTime: SUPPLIER_STALE_TIME,
    });
}

export function useSupplierQuotations(
    branchId: string,
    supplierId: string | null,
    params: { page?: number; pageSize?: number; search?: string; status?: string } = {},
) {
    return useQuery({
        queryKey: queryKeys.supplierQuotations(branchId, supplierId || '', params),
        queryFn: () => getSupplierQuotationsAction(supplierId as string, params),
        enabled: !!branchId && !!supplierId,
        staleTime: SUPPLIER_STALE_TIME,
    });
}

export function useUpdateSupplier(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
            updateSupplierAction(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.suppliers(branchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.supplier(variables.id) });
            queryClient.invalidateQueries({
                queryKey: queryKeys.supplierQuotations(branchId, variables.id),
            });
        },
    });
}

export function useDeleteSupplier(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteSupplierAction(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.suppliers(branchId) });
            queryClient.removeQueries({ queryKey: queryKeys.supplier(id) });
            queryClient.removeQueries({ queryKey: queryKeys.supplierQuotations(branchId, id) });
        },
    });
}
