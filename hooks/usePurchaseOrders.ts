import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    fetchPurchaseOrderById,
    createPurchaseOrder,
    type POFilters,
    type PurchaseOrder,
} from '@/lib/api';
import { listPurchaseOrders } from '@/app/actions/purchaseOrder';

export function usePurchaseOrders(branchId: string, params: POFilters = {}) {
    return useQuery({
        queryKey: queryKeys.purchaseOrders(branchId, params),
        queryFn: () => listPurchaseOrders(branchId, params),
        enabled: !!branchId,
    });
}

export function usePurchaseOrder(id: string) {
    return useQuery({
        queryKey: queryKeys.purchaseOrder(id),
        queryFn: () => fetchPurchaseOrderById(id),
        enabled: !!id,
    });
}

export function useCreatePurchaseOrder(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Omit<PurchaseOrder, 'id' | 'createdAt'>) =>
            createPurchaseOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders', branchId] });
        },
    });
}
