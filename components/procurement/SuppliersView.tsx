'use client';

import { useState } from 'react';
import {
    Users, Star, MapPin, AlertCircle,
    ShieldCheck,
    Plus, ExternalLink,
    TrendingUp, Link
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { NewSupplierModal } from './NewSupplierModal';
import { SendRFQModal } from './SendRFQModal';
import { SupplierDetailModal } from './SupplierDetailModal';
import { useSuppliers, useCreateSupplier } from '@/hooks/useSuppliers';
import { useBranch } from '@/hooks/useBranch';
import { useCurrency } from '@/hooks/useCurrency';
import { ErrorState } from '@/components/ui/error-state';
import type { CreateSupplierPayload } from '@/lib/api';
import { emitOnboardingAction } from '@/onboarding/helpers';

const SUPPLIER_STATS_META = [
    { label: 'Total Suppliers', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Lead Time', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Risk Alerts', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Preferred Partners', icon: ShieldCheck, color: 'text-amber-700', bg: 'bg-amber-50' },
];

function SupplierSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-3">
            <div className="flex justify-between">
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                <div className="h-5 w-20 rounded bg-gray-200" />
            </div>
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-100" />
            <div className="h-3 w-40 rounded bg-gray-100" />
        </div>
    );
}

export function SuppliersView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { branchId } = useBranch();
    const { format: f } = useCurrency();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRFQModalOpen, setIsRFQModalOpen] = useState(false);
    const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
    const [selectedSupplierForDetail, setSelectedSupplierForDetail] = useState<string | null>(null);

    const { data, isLoading, isError, error } = useSuppliers(branchId, {
        search: searchTerm || undefined,
    });

    const createSupplierMutation = useCreateSupplier(branchId);
    const suppliers = data?.data ?? [];
    const isSupplierModalVisible = isModalOpen || searchParams.get('action') === 'new-supplier';

    function handleCreateSupplier(payload: CreateSupplierPayload) {
        createSupplierMutation.mutate(payload, {
            onSuccess: () => {
                emitOnboardingAction('create-supplier');
                closeSupplierModal();
            },
        });
    }

    function closeSupplierModal() {
        setIsModalOpen(false);

        if (searchParams.get('action') !== 'new-supplier') {
            return;
        }

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete('action');
        const query = nextParams.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }

    const toggleSupplier = (id: string) => {
        setSelectedSupplierIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedSupplierIds.length === suppliers.length) {
            setSelectedSupplierIds([]);
        } else {
            setSelectedSupplierIds(suppliers.map((supplier) => supplier.id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <NewSupplierModal
                isOpen={isSupplierModalVisible}
                onClose={closeSupplierModal}
                onSubmit={handleCreateSupplier}
                isPending={createSupplierMutation.isPending}
                branchId={branchId}
            />

            <SendRFQModal
                isOpen={isRFQModalOpen}
                onClose={() => setIsRFQModalOpen(false)}
                selectedSuppliers={suppliers.filter((supplier) => selectedSupplierIds.includes(supplier.id))}
                onSuccess={() => setSelectedSupplierIds([])}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Supplier Directory</h2>
                    <p className="text-sm text-gray-500">Manage and evaluate your supply chain partners</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-4 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-700 to-yellow-600 text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-lg transition-all"
                        data-tour="add-supplier-btn"
                    >
                        <Plus className="h-4 w-4" />
                        Add Supplier
                    </button>
                </div>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between gap-4 overflow-x-auto">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <Link className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900">RFQ Supplier Portal</p>
                        <p className="text-[10px] text-gray-500">Live supplier links are generated when you broadcast an RFQ.</p>
                    </div>
                </div>
                <p className="text-[11px] font-bold text-amber-700 bg-white border border-amber-200 px-3 py-1.5 rounded-lg shrink-0">
                    Use RFQ broadcast to issue real supplier tokens
                </p>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {SUPPLIER_STATS_META.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {isLoading ? '—' : idx === 0 ? (data?.total ?? '—') : '—'}
                            </p>
                        </div>
                        <div className={clsx("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                    </div>
                ))}
            </div>

            {isError && (
                <div className="py-12">
                    <ErrorState
                        title="Supplier Directory Error"
                        error={error as Error}
                        onRetry={() => window.location.reload()}
                    />
                </div>
            )}

            {!isError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading && Array.from({ length: 6 }).map((_, i) => <SupplierSkeleton key={i} />)}

                    {!isLoading && suppliers.map((supplier) => (
                        <motion.div
                            key={supplier.id}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedSupplierForDetail(supplier.id)}
                            className={clsx(
                                "bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative group",
                                selectedSupplierIds.includes(supplier.id) ? "border-black ring-1 ring-black" : "border-gray-100"
                            )}
                        >
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSupplier(supplier.id);
                                }}
                                className={clsx(
                                    "absolute top-4 right-4 h-5 w-5 rounded border transition-colors flex items-center justify-center z-10",
                                    selectedSupplierIds.includes(supplier.id)
                                        ? "bg-black border-black text-white"
                                        : "border-gray-200 bg-white group-hover:border-gray-400"
                                )}
                            >
                                {selectedSupplierIds.includes(supplier.id) && (
                                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 4.5L4.5 8L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                    <span className="text-lg font-bold text-gray-400">{supplier.name.charAt(0)}</span>
                                </div>
                                <span className={clsx(
                                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mr-8",
                                    supplier.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                )}>
                                    {supplier.status}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg">{supplier.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{supplier.category}</p>

                            <div className="space-y-2 mb-6 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    {supplier.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                    <span className="font-bold">{supplier.rating}</span>
                                    <span className="text-gray-400">• Reliability {supplier.reliability}%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Total Spend</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {f(supplier.spend)}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {supplier.tags.map((tag, i) => (
                                        <div key={i} className="h-6 px-2 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-medium capitalize">
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {!isLoading && !isError && suppliers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Users className="h-12 w-12 mb-2 opacity-50" />
                    <p>No suppliers found. Add your first supplier to get started.</p>
                </div>
            )}

            <AnimatePresence>
                {selectedSupplierIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, x: '-50%', opacity: 0 }}
                        animate={{ y: 0, x: '-50%', opacity: 1 }}
                        exit={{ y: 100, x: '-50%', opacity: 0 }}
                        className="fixed bottom-8 left-1/2 z-40 bg-[#2a2b2d] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 min-w-[500px]"
                    >
                        <div className="flex items-center gap-3 pr-8 border-r border-gray-700">
                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-black">
                                {selectedSupplierIds.length}
                            </div>
                            <div>
                                <p className="text-sm font-bold">Suppliers Selected</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSupplierIds([]);
                                    }}
                                    className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hover:text-white"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1">
                            <button
                                onClick={selectAll}
                                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/20 transition-colors"
                            >
                                {selectedSupplierIds.length === suppliers.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <button
                                onClick={() => setIsRFQModalOpen(true)}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-colors shadow-lg"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Send Quotation Request
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SupplierDetailModal
                isOpen={!!selectedSupplierForDetail}
                onClose={() => setSelectedSupplierForDetail(null)}
                supplierId={selectedSupplierForDetail}
                onDeleted={() => setSelectedSupplierForDetail(null)}
            />
        </div>
    );
}
