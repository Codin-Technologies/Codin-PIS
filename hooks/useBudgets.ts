import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    listBudgetsAction, 
    getBudgetAction,
    createBudgetAction, 
    updateBudgetAction, 
    deleteBudgetAction 
} from '@/app/actions/budget';
import type { 
    CreateBudgetPayload, 
    UpdateBudgetPayload, 
    BudgetFilters 
} from '@/lib/api';

export function useBudgets(branchId: string, filters: BudgetFilters = {}) {
    return useQuery({
        queryKey: ['budgets', branchId, filters],
        queryFn: () => listBudgetsAction(branchId, filters),
        enabled: !!branchId,
    });
}

/**
 * useBudget — single budget detail query.
 */
export function useBudget(id: string) {
    return useQuery({
        queryKey: ['budget', id],
        queryFn: () => getBudgetAction(id),
        enabled: !!id,
    });
}

export function useCreateBudget(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateBudgetPayload) => createBudgetAction(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets', branchId] });
        },
    });
}

export function useUpdateBudget(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateBudgetPayload }) => 
            updateBudgetAction(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets', branchId] });
        },
    });
}

export function useDeleteBudget(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteBudgetAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets', branchId] });
        },
    });
}
