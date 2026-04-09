import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    getProductionPlansAction,
    createProductionPlanAction,
    updateProductionPlanStatusAction,
    deductProductionInventoryAction,
    getSpecialOrdersAction,
    createSpecialOrderAction,
    updateSpecialOrderStatusAction
} from '@/app/actions/kitchen';
import type {
    CreateProductionPlanPayload,
    CreateSpecialOrderPayload,
    ProductionPlan,
    SpecialOrder,
    DeductionPayload
} from '@/lib/api';

export function useProductionPlans(branchId: string) {
    return useQuery({
        queryKey: queryKeys.kitchenProduction(branchId),
        queryFn: () => getProductionPlansAction(branchId),
        enabled: !!branchId,
    });
}

export function useCreateProductionPlan(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateProductionPlanPayload) => createProductionPlanAction(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kitchenProduction(branchId) });
        },
    });
}

export function useUpdateProductionPlanStatus(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: ProductionPlan['status'] }) =>
            updateProductionPlanStatusAction(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kitchenProduction(branchId) });
        },
    });
}

export function useDeductProductionInventory(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload?: DeductionPayload }) => 
            deductProductionInventoryAction(id, payload),
        meta: { errorTitle: 'Failed to approve requisition' },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kitchenProduction(branchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory(branchId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventoryUsage(branchId) });
        }
    });
}

export function useSpecialOrders(branchId: string) {
    return useQuery({
        queryKey: queryKeys.kitchenSpecialOrders(branchId),
        queryFn: () => getSpecialOrdersAction(branchId),
        enabled: !!branchId,
    });
}

export function useCreateSpecialOrder(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSpecialOrderPayload) => createSpecialOrderAction(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kitchenSpecialOrders(branchId) });
        },
    });
}

export function useUpdateSpecialOrderStatus(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: SpecialOrder['status'] }) =>
            updateSpecialOrderStatusAction(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.kitchenSpecialOrders(branchId) });
        },
    });
}
