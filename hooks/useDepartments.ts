import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartmentsAction, createDepartmentAction } from '@/app/actions/departments';

export function useDepartments(branchId: string) {
    return useQuery({
        queryKey: ['departments', branchId],
        queryFn: () => getDepartmentsAction(branchId),
        enabled: !!branchId,
    });
}

export function useCreateDepartment(branchId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => createDepartmentAction(branchId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments', branchId] });
        },
    });
}
