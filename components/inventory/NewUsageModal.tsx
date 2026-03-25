'use client';

import { useState } from 'react';
import {
    X, Trash2, Save, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { useInventory, useRecordInventoryUsage } from '@/hooks/useInventory';
import { useBranch } from '@/hooks/useBranch';
import type { InventoryItem } from '@/lib/api';

interface NewUsageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewUsageModal({ isOpen, onClose }: NewUsageModalProps) {
    const { data: session } = useSession();
    const { branchId } = useBranch();
    const { data: inventoryData, isLoading: isInventoryLoading } = useInventory(branchId);
    const { mutate: recordUsage, isPending: isSaving } = useRecordInventoryUsage(branchId);
    
    const inventoryItems = inventoryData?.data ?? [];
    const [lineItems, setLineItems] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        reason: 'Waste',
        notes: ''
    });

    const addItem = (item: InventoryItem) => {
        if (!lineItems.find(i => i.id === item.id)) {
            setLineItems([...lineItems, { ...item, usageQty: 0 }]);
        }
    };

    const handleSave = () => {
        if (lineItems.length === 0) return;
        if (!session?.user?.id) {
            toast.error("You must be logged in to record usage");
            return;
        }

        const payload = {
            date: formData.date,
            reason: formData.reason,
            notes: formData.notes,
            organizationId: (session.user as any).organizationId || '',
            recordedById: session.user.id,
            items: lineItems.map(line => ({
                inventoryItemId: line.id,
                qtyUsed: line.usageQty
            }))
        };

        recordUsage(payload, {
            onSuccess: () => {
                toast.success("Usage recorded successfully");
                onClose();
                setLineItems([]);
                setFormData({ date: new Date().toISOString().split('T')[0], reason: 'Waste', notes: '' });
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to record usage");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    className="h-full w-full max-w-2xl bg-[#f8f9fc] shadow-2xl overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-8 py-5 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Record Stock Usage</h2>
                            <p className="text-xs text-gray-500">Log consumption, waste, or transfers</p>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">

                        {/* 1. Usage Details */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs mr-2">1</div>
                                Usage Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-[#2a2b2d] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason</label>
                                    <div className="flex space-x-2">
                                        {['Waste', 'Consumption', 'Theft', 'Other'].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setFormData({ ...formData, reason: r })}
                                                className={clsx("flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                                                    formData.reason === r
                                                        ? 'bg-black text-white border-black'
                                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                )}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                                    <textarea
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 h-20 focus:ring-2 focus:ring-[#2a2b2d] focus:border-transparent outline-none resize-none"
                                        placeholder="Optional notes..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </section>

                        {/* 2. Items */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs mr-2">2</div>
                                    Items to Record
                                </div>
                            </h3>

                            {/* Quick Add */}
                            <div className="mb-4">
                                <select
                                    disabled={isInventoryLoading}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-[#2a2b2d] outline-none"
                                    onChange={(e) => {
                                        const item = inventoryItems.find(i => i.id === e.target.value);
                                        if (item) {
                                            addItem(item);
                                            e.target.value = ""; // Reset select
                                        }
                                    }}
                                >
                                    <option value="">{isInventoryLoading ? 'Loading items...' : '+ Add Item to List...'}</option>
                                    {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.qty} {i.unit} on hand)</option>)}
                                </select>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Item</th>
                                            <th className="px-4 py-3 w-32">Qty Used</th>
                                            <th className="px-4 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {lineItems.map((line, idx) => (
                                            <tr key={idx} className="group hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-gray-900">{line.name}</p>
                                                    <p className="text-xs text-gray-500">{line.unit} • Stock: {line.qty}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        min="0"
                                                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-center font-bold focus:ring-2 focus:ring-[#2a2b2d] outline-none"
                                                        value={line.usageQty}
                                                        onChange={(e) => {
                                                            const newItems = [...lineItems];
                                                            newItems[idx].usageQty = parseFloat(e.target.value) || 0;
                                                            setLineItems(newItems);
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {lineItems.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">No items added yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="pb-10 pt-4 flex items-center justify-end gap-4">
                            <button 
                                onClick={onClose} 
                                disabled={isSaving}
                                className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={lineItems.length === 0 || isSaving}
                                className="px-8 py-3 rounded-xl bg-[#2a2b2d] font-bold text-white shadow-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Record
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
