/**
 * hooks/useBranch.ts
 * ───────────────────────────────────────────────────────────
 * BRANCH-AWARE INVALIDATION EXAMPLE
 *
 * Provides the current branchId and an invalidateAllBranchQueries()
 * function that clears all branch-scoped cache when the user switches branches.
 *
 * Integration note:
 * - branchId is currently derived from the user's session (single-branch per user).
 * - When multi-branch switching UI is added, call invalidateAllBranchQueries(oldBranchId)
 *   before updating the active branch so stale data from the previous branch
 *   is never shown under the new branch.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

// Adjust this selector once session shape is confirmed with the auth team.
// The branchId should come from the JWT/session token set by the backend.
function getBranchIdFromSession(session: ReturnType<typeof useSession>['data']): string {
    // Fallback to empty string so enabled: !!branchId guards prevent premature fetching
    return (session?.user as { branchId?: string })?.branchId ?? '';
}

export function useBranch() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const branchId = getBranchIdFromSession(session);

    /**
     * invalidateAllBranchQueries — call this on branch switch.
     * Uses partial key matching: any query whose key starts with
     * [moduleName, branchId] will be marked stale and refetched.
     */
    function invalidateAllBranchQueries(targetBranchId: string) {
        const branchScopes = [
            'requisitions',
            'purchaseOrders',
            'grns',
            'rfqs',
            'suppliers',
            'inventory',
            'issuances',
            'wasteLogs',
            'recipes',
            'reports',
            'auditLogs',
        ];

        branchScopes.forEach((scope) => {
            queryClient.invalidateQueries({
                queryKey: [scope, targetBranchId],
            });
        });
    }

    return { branchId, invalidateAllBranchQueries };
}
