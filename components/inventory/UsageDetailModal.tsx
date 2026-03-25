'use client';

import { X, Calendar, User, FileText, Package, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventoryUsageDetail } from '@/hooks/useInventory';
import clsx from 'clsx';

interface UsageDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    usageId: string | null;
}

export function UsageDetailModal({ isOpen, onClose, usageId }: UsageDetailModalProps) {
    const { data: response, isLoading } = useInventoryUsageDetail(usageId || '');
    const detail = response?.data;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Usage Record Details</h2>
                            <p className="text-sm text-gray-500">ID: #{usageId}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="h-12 w-12 border-4 border-gray-100 border-t-[#2a2b2d] rounded-full animate-spin"></div>
                                <p className="text-gray-500 font-medium">Fetching record details...</p>
                            </div>
                        ) : detail ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 uppercase">Usage Date</p>
                                            <p className="text-lg font-bold text-gray-900">{detail.date}</p>
                                        </div>
                                    </div>
                                    <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-purple-600 uppercase">Reason</p>
                                            <p className="text-lg font-bold text-gray-900">{detail.reason}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="space-y-4 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <User className="h-4 w-4" />
                                            <span>Recorded By:</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{detail.recordedBy.fullName} ({detail.recordedBy.email})</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Info className="h-4 w-4" />
                                            <span>Created At:</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{new Date(detail.createdAt).toLocaleString()}</span>
                                    </div>
                                    {detail.notes && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Notes</p>
                                            <p className="text-sm text-gray-700 leading-relaxed italic">"{detail.notes}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Items Table */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Impacted Items
                                        </h3>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                                            {detail.items.length} Total
                                        </span>
                                    </div>
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                                <tr>
                                                    <th className="px-6 py-4">Item Name</th>
                                                    <th className="px-6 py-4 text-center">Qty Used</th>
                                                    <th className="px-6 py-4 text-right">Current Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {detail.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-gray-900">{item.inventoryItemName}</p>
                                                            <p className="text-xs text-gray-500">Unit: {item.unit}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-lg font-bold">
                                                                -{item.qtyUsed}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={clsx(
                                                                "font-bold",
                                                                item.currentStock <= 0 ? "text-red-500" : "text-gray-900"
                                                            )}>
                                                                {item.currentStock} {item.unit}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-red-500 font-medium">Failed to load record details.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-[#2a2b2d] text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-95"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
