'use client';

import { useState } from 'react';
import {
    Users, Star, MapPin, AlertCircle,
    ShieldCheck,
    Plus, ExternalLink,
    TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { NewSupplierModal } from './NewSupplierModal';
import { useSuppliers, useCreateSupplier } from '@/hooks/useSuppliers';
import { useBranch } from '@/hooks/useBranch';
import { ErrorState } from '@/components/ui/error-state';
import type { CreateSupplierPayload } from '@/lib/api';

const SUPPLIER_STATS_META = [
    { label: 'Total Suppliers',    icon: Users,       color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
    { label: 'Avg Lead Time',      icon: TrendingUp,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Risk Alerts',        icon: AlertCircle, color: 'text-amber-600',   bg: 'bg-amber-50'   },
    { label: 'Preferred Partners', icon: ShieldCheck, color: 'text-blue-600',    bg: 'bg-blue-50'    },
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
    const { branchId } = useBranch();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading, isError, error } = useSuppliers(branchId, {
        search: searchTerm || undefined,
    });

    const createSupplierMutation = useCreateSupplier(branchId);

    const suppliers = data?.data ?? [];

    function handleCreateSupplier(payload: CreateSupplierPayload) {
        createSupplierMutation.mutate(payload, {
            onSuccess: () => setIsModalOpen(false),
        });
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <NewSupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Header */}
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
                            className="pl-4 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800"
                    >
                        <Plus className="h-4 w-4" />
                        Add Supplier
                    </button>
                </div>
            </div>

            {/* Stats — placeholder values until a dedicated stats endpoint is added */}
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

            {/* Error state */}
            {isError && (
                <div className="py-12">
                    <ErrorState 
                        title="Supplier Directory Error"
                        error={error as Error}
                        onRetry={() => window.location.reload()}
                    />
                </div>
            )}

            {/* Supplier Grid */}
            {!isError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading && Array.from({ length: 6 }).map((_, i) => <SupplierSkeleton key={i} />)}

                    {!isLoading && suppliers.map((supplier) => (
                        <motion.div
                            key={supplier.id}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                    <span className="text-lg font-bold text-gray-400">{supplier.name.charAt(0)}</span>
                                </div>
                                <span className={clsx("px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
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
                                        ${supplier.spend.toLocaleString()}
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

            {/* Empty state */}
            {!isLoading && !isError && suppliers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Users className="h-12 w-12 mb-2 opacity-50" />
                    <p>No suppliers found. Add your first supplier to get started.</p>
                </div>
            )}
        </div>
    );
}
