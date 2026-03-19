import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchReport, type ReportFilters } from '@/lib/api';

/**
 * useReport — report queries explicitly disable window focus refetch
 * because report data is expensive to compute and should only refresh
 * when the user deliberately changes filters.
 */
export function useReport<T = unknown>(
    branchId: string,
    type: string,
    filters: ReportFilters = {}
) {
    return useQuery<T>({
        queryKey: queryKeys.reports(branchId, type, filters),
        queryFn: () => fetchReport<T>(branchId, type, filters),
        enabled: !!branchId && !!type,
        refetchOnWindowFocus: false, // Override global default for reports
    });
}
