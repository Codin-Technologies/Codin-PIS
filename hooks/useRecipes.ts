import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchRecipes, type RecipeFilters } from '@/lib/api';

export function useRecipes(branchId: string, params: RecipeFilters = {}) {
    return useQuery({
        queryKey: queryKeys.recipes(branchId, params),
        queryFn: () => fetchRecipes(branchId, params),
        enabled: !!branchId,
    });
}
