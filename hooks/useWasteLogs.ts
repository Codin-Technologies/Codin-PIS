import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchWasteLogs, type WasteLogFilters } from '@/lib/api';

export function useWasteLogs(branchId: string, params: WasteLogFilters = {}) {
    return useQuery({
        queryKey: queryKeys.wasteLogs(branchId, params),
        queryFn: () => fetchWasteLogs(branchId, params),
        enabled: !!branchId,
    });
}
