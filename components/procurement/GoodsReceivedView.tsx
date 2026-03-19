'use client';

import { useState } from 'react';
import {
    Truck, AlertTriangle, CheckCircle,
    Calendar, Plus, Eye, ArrowRight,
    ShieldCheck, ClipboardCheck, History,
    Warehouse, Beaker, Scale, AlertCircle, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { useGRNs } from '@/hooks/useGRN';
import { useBranch } from '@/hooks/useBranch';
import { ErrorState } from '@/components/ui/error-state';
import type { GRN } from '@/lib/api';

const GRN_STATS = [
    { label: "Today's Deliveries", value: '—', icon: Truck,       color: 'text-blue-600',  bg: 'bg-blue-50'  },
    { label: 'Pending Inspection', value: '—', icon: Beaker,      color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Quality Pass Rate',  value: '—', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Discrepancy Rate',   value: '—', icon: Scale,       color: 'text-red-600',   bg: 'bg-red-50'   },
];

// ─── GRN Dashboard ────────────────────────────────────────────────────────────

function GRNDashboard({
    grns,
    isLoading,
    isError,
    error,
    onReceive,
}: {
    grns: GRN[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    onReceive: () => void;
}) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
                {GRN_STATS.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={clsx("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Goods Inward Log</h3>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50">
                        <History className="h-4 w-4" />
                        Gate Pass Log
                    </button>
                    <button
                        onClick={onReceive}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800"
                    >
                        <Warehouse className="h-4 w-4" />
                        Receive Goods
                    </button>
                </div>
            </div>

            {/* Error state */}
            {isError && (
                <div className="py-12">
                    <ErrorState 
                        title="GRN Load Failure"
                        error={error as Error}
                        onRetry={() => window.location.reload()}
                    />
                </div>
            )}

            {/* GRN Table */}
            {!isError && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">GRN Number</th>
                                <th className="px-6 py-4">Source PO</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4">Date Received</th>
                                <th className="px-6 py-4">Inspection</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading && Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {Array.from({ length: 7 }).map((__, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-3 bg-gray-200 rounded w-24" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {!isLoading && grns.map(grn => (
                                <tr key={grn.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{grn.id}</td>
                                    <td className="px-6 py-4 text-gray-600">{grn.poNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                {grn.supplier.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900">{grn.supplier}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{grn.receivedDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-max",
                                            grn.inspection === 'Passed'      ? 'bg-green-50 text-green-700' :
                                            grn.inspection === 'Failed'      ? 'bg-red-50 text-red-700'     : 'bg-amber-50 text-amber-700'
                                        )}>
                                            {grn.inspection === 'Passed'     && <ShieldCheck className="h-3 w-3" />}
                                            {grn.inspection === 'Failed'     && <AlertTriangle className="h-3 w-3" />}
                                            {grn.inspection === 'In Progress'&& <Beaker className="h-3 w-3" />}
                                            {grn.inspection}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx("px-2 py-1 rounded-md text-[10px] font-bold",
                                            grn.status === 'Fully Received' ? 'text-green-600 bg-green-50' :
                                            grn.status === 'Quarantined'    ? 'text-red-600 bg-red-50'     : 'text-blue-600 bg-blue-50'
                                        )}>
                                            {grn.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!isLoading && !isError && grns.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Truck className="h-10 w-10 mb-2 opacity-40" />
                            <p className="text-sm">No goods received records found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Receive Flow (DEPENDENT QUERY EXAMPLE) ───────────────────────────────────

function ReceiveFlow({ onBack }: { onBack: () => void }) {
    const { branchId } = useBranch();
    const [poInput, setPoInput] = useState('');
    // purchaseOrderId drives the dependent query — only set after "Verify PO"
    const [purchaseOrderId, setPurchaseOrderId] = useState('');

    // Dependent query: only fires once purchaseOrderId is set
    const { data, isLoading, isError } = useGRNs(branchId, {
        purchaseOrderId: purchaseOrderId || undefined,
    });

    const handleVerify = () => {
        const trimmed = poInput.trim();
        if (trimmed) setPurchaseOrderId(trimmed);
    };

    return (
        <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-full border border-gray-100">
                    <ArrowRight className="h-5 w-5 rotate-180 text-gray-500" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Receive Goods</h2>
                    <p className="text-sm text-gray-500">Scan PO or Enter Document Number to Start</p>
                </div>
            </div>

            <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center">
                <div className="h-20 w-20 rounded-2xl bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center mx-auto mb-6">
                    <ClipboardCheck className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Initiate Inbound Receipt</h3>
                <p className="text-sm text-gray-500 mb-8">
                    Enter the Purchase Order number or scan the delivery note barcode to begin quantity and quality verification.
                </p>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={poInput}
                        onChange={(e) => setPoInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                        placeholder="Scan or Enter PO Number (e.g., PO-2026-8805)"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                    <button
                        onClick={handleVerify}
                        disabled={isLoading}
                        className="bg-[#2a2b2d] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-shadow shadow-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Verify PO
                    </button>
                </div>

                {/* Verification result */}
                {purchaseOrderId && !isLoading && data && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-left">
                        <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-1">
                            <CheckCircle className="h-4 w-4" />
                            PO Found — {data.total} existing GRN(s) for this PO
                        </div>
                        <p className="text-xs text-green-600">Ready to proceed with goods receiving.</p>
                    </div>
                )}

                {purchaseOrderId && isError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                            <AlertCircle className="h-4 w-4" />
                            PO not found or invalid
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function GoodsReceivedView() {
    const { branchId } = useBranch();
    const [view, setView] = useState<'DASHBOARD' | 'RECEIVE'>('DASHBOARD');

    // Dashboard-level GRN list (no PO filter)
    const { data, isLoading, isError, error } = useGRNs(branchId);
    const grns = data?.data ?? [];

    return (
        <div className="h-full">
            {view === 'DASHBOARD' && (
                <GRNDashboard
                    grns={grns}
                    isLoading={isLoading}
                    isError={isError}
                    error={error as Error | null}
                    onReceive={() => setView('RECEIVE')}
                />
            )}
            {view === 'RECEIVE' && (
                <ReceiveFlow onBack={() => setView('DASHBOARD')} />
            )}
        </div>
    );
}
