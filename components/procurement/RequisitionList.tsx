'use client';

import { useState } from 'react';
import {
    Search, MoreHorizontal, CheckCircle,
    Clock, XCircle, AlertCircle, FileText, ChevronRight, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { RequisitionDetailModal } from './RequisitionDetailModal';
import { useRequisitions, useUpdateRequisitionStatus } from '@/hooks/useRequisitions';
import { useBranch } from '@/hooks/useBranch';
import { ErrorState } from '@/components/ui/error-state';
import type { Requisition } from '@/lib/api';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
    'Pending':   { color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
    'Approved':  { color: 'text-blue-600',   bg: 'bg-blue-50',   icon: CheckCircle },
    'In Review': { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
    'Ordered':   { color: 'text-purple-600', bg: 'bg-purple-50', icon: FileText },
    'Delivered': { color: 'text-green-600',  bg: 'bg-green-50',  icon: CheckCircle },
    'Rejected':  { color: 'text-red-600',    bg: 'bg-red-50',    icon: XCircle },
};

// --- Loading skeleton row ---
function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                        <div className="h-3 w-40 rounded bg-gray-200" />
                        <div className="h-2 w-32 rounded bg-gray-100" />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 hidden md:table-cell"><div className="h-3 w-20 rounded bg-gray-200" /></td>
            <td className="px-6 py-4"><div className="h-3 w-16 rounded bg-gray-200" /></td>
            <td className="px-6 py-4"><div className="h-6 w-24 rounded-full bg-gray-200" /></td>
            <td className="px-6 py-4"><div className="h-8 w-8 rounded-full bg-gray-100 ml-auto" /></td>
        </tr>
    );
}

export function RequisitionList() {
    const { branchId } = useBranch();
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm]     = useState('');
    const [selectedReq, setSelectedReq]   = useState<Requisition | null>(null);

    // ── Data Fetching ────────────────────────────────────────────
    const { data, isLoading, isError, error } = useRequisitions(branchId, {
        status: filterStatus,
        search: searchTerm,
    });

    const statusMutation = useUpdateRequisitionStatus(branchId);

    const requisitions = data?.data ?? [];

    // ── Handlers ─────────────────────────────────────────────────
    const handleStatusChange = (id: string, newStatus: Requisition['status']) => {
        statusMutation.mutate(
            { id, status: newStatus },
            { onSuccess: () => setSelectedReq(null) }
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {selectedReq && (
                <RequisitionDetailModal
                    requisition={selectedReq}
                    isOpen={!!selectedReq}
                    onClose={() => setSelectedReq(null)}
                    onApprove={() => handleStatusChange(selectedReq.id, 'Approved')}
                    onReject={() => handleStatusChange(selectedReq.id, 'Rejected')}
                />
            )}

            {/* Header / Controls */}
            <div className="p-6 border-b border-gray-100 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Pending', 'In Review', 'Approved', 'Ordered', 'Delivered', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors",
                                filterStatus === status
                                    ? 'bg-[#2a2b2d] text-white shadow-md'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Requisitions..."
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a2b2d] w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-0 md:p-2">

                {/* ── Error State ── */}
                {isError && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <ErrorState 
                            title="Requisitions Unavailable"
                            error={error as Error} 
                            onRetry={() => window.location.reload()}
                        />
                    </div>
                )}

                {!isError && (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs hidden md:table-header-group">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Requisition Details</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 rounded-tr-xl">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">

                            {/* ── Loading State ── */}
                            {isLoading && Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonRow key={i} />
                            ))}

                            {/* ── Data ── */}
                            {!isLoading && requisitions.map((req) => {
                                const cfg = STATUS_CONFIG[req.status] ?? {
                                    color: 'text-gray-600', bg: 'bg-gray-50', icon: AlertCircle,
                                };
                                const StatusIcon = cfg.icon;
                                return (
                                    <tr
                                        key={req.id}
                                        onClick={() => setSelectedReq(req)}
                                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                                                    {req.requestedBy.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{req.subject}</p>
                                                    <p className="text-xs text-gray-500">{req.id} • {req.date} • {req.requestedBy}</p>
                                                </div>
                                                {req.priority === 'Emergency' && (
                                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                        URGENT
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="font-medium text-gray-700">{req.dept}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            ${req.value.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                                                cfg.bg, cfg.color
                                            )}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* ── Empty State ── */}
                {!isLoading && !isError && requisitions.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <FileText className="h-12 w-12 mb-2 opacity-50" />
                        <p>No requisitions found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
