'use client';

import { useState } from 'react';
import { X, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { InventoryItem } from '@/lib/api';

interface RecordUsageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdjust: (id: string, payload: { qtyDelta: number; reason: string }) => void;
    item: InventoryItem | null;
    isPending?: boolean;
    error?: Error | null;
}

export function RecordUsageModal({ isOpen, onClose, onAdjust, item, isPending, error }: RecordUsageModalProps) {
    const [qtyDelta, setQtyDelta] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (item) {
            onAdjust(item.id, {
                qtyDelta: Number(qtyDelta), // usually negative for usage
                reason
            });
            setQtyDelta('');
            setReason('');
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Adjust Quantity</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error.message || 'Failed to adjust quantity.'}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            Current Stock for <strong>{item.name}</strong>: <span className="text-gray-900 font-bold">{item.qty} {item.unit}</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Quantity Change (e.g. -5 for usage, +10 for finding stock)
                        </label>
                        <input
                            required
                            type="number"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                            value={qtyDelta}
                            onChange={e => setQtyDelta(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason / Notes</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="e.g. Used for daily prep, found extra in storage..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d] resize-none"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-3 bg-[#2a2b2d] text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <SlidersHorizontal className="h-4 w-4" />
                            )}
                            {isPending ? 'Applying...' : 'Apply Change'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
