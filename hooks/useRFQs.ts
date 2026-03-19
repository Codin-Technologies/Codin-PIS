import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchRFQs, type RFQFilters } from '@/lib/api';

export function useRFQs(branchId: string, params: RFQFilters = {}) {
    return useQuery({
        queryKey: queryKeys.rfqs(branchId, params),
        queryFn: () => fetchRFQs(branchId, params),
        enabled: !!branchId,
    });
}
