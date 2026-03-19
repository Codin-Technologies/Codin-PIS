import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchAuditLogs, type AuditLogFilters } from '@/lib/api';

/**
 * useAuditLogs — read-only paginated query.
 * No mutations exposed: audit logs are append-only and written by the backend.
 */
export function useAuditLogs(branchId: string, params: AuditLogFilters = {}) {
    return useQuery({
        queryKey: queryKeys.auditLogs(branchId, params),
        queryFn: () => fetchAuditLogs(branchId, params),
        enabled: !!branchId,
    });
}
