'use client';

import { useState } from 'react';
import { X, Plus, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { Department } from '@/lib/api';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: any) => void;
    departments: Department[];
    isPending?: boolean;
    error?: Error | null;
}

export function AddItemModal({ isOpen, onClose, onAdd, departments = [], isPending, error }: AddItemModalProps) {
    const [newItem, setNewItem] = useState({
        name: '',
        sku: '',
        dept: 'Kitchen',
        qty: 0,
        unit: 'kg',
        status: 'Good',
        image: '📦',
        minQty: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            id: Date.now(), // Mock ID
            ...newItem,
            qty: Number(newItem.qty),
            minQty: Number(newItem.minQty)
        });
        // Reset form
        setNewItem({
            name: '',
            sku: '',
            dept: 'Kitchen',
            qty: 0,
            unit: 'kg',
            status: 'Good',
            image: '📦',
            minQty: 0
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Add New Inventory Item</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error.message || 'Failed to add item. Please try again.'}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Olive Oil"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU / Code</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. OIL-005"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                value={newItem.sku}
                                onChange={e => setNewItem({ ...newItem, sku: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d] bg-white"
                                value={newItem.dept}
                                onChange={e => setNewItem({ ...newItem, dept: e.target.value })}
                            >
                                <option value="All" disabled>Select Department</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qty</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                value={newItem.qty}
                                onChange={e => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Qty</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                value={newItem.minQty}
                                onChange={e => setNewItem({ ...newItem, minQty: Number(e.target.value) })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d] bg-white"
                                value={newItem.unit}
                                onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                            >
                                <option value="kg">kg</option>
                                <option value="L">L</option>
                                <option value="pcs">pcs</option>
                                <option value="btl">btl</option>
                                <option value="can">can</option>
                                <option value="box">box</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon</label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d] bg-white text-xl"
                                value={newItem.image}
                                onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                            >
                                <option value="📦">📦</option>
                                <option value="🍅">🍅</option>
                                <option value="🥩">🥩</option>
                                <option value="🍷">🍷</option>
                                <option value="🧼">🧼</option>
                                <option value="🍚">🍚</option>
                                <option value="🍝">🍝</option>
                            </select>
                        </div>
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
                                <Plus className="h-4 w-4" />
                            )}
                            {isPending ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
