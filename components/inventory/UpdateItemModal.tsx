'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import type { InventoryItem, Department } from '@/lib/api';

interface UpdateItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, payload: any) => void;
    departments: Department[];
    item: InventoryItem | null;
}

export function UpdateItemModal({ isOpen, onClose, onUpdate, departments, item }: UpdateItemModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        dept: 'Kitchen',
        qty: 0,
        unit: 'kg',
        minQty: 0,
        unitCost: 0,
        image: '📦'
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                sku: item.sku,
                dept: item.dept,
                qty: item.qty,
                unit: item.unit,
                minQty: item.minQty || 0,
                unitCost: item.unitCost || 0,
                image: item.image || '📦'
            });
        }
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (item) {
            onUpdate(item.id, {
                ...formData,
                qty: Number(formData.qty),
                minQty: Number(formData.minQty),
                unitCost: Number(formData.unitCost)
            });
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Update Inventory Item</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU / Code</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d] bg-white"
                                value={formData.dept}
                                onChange={e => setFormData({ ...formData, dept: e.target.value })}
                            >
                                {departments.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qty</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                value={formData.qty}
                                onChange={e => setFormData({ ...formData, qty: Number(e.target.value) })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Qty</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                value={formData.minQty}
                                onChange={e => setFormData({ ...formData, minQty: Number(e.target.value) })}
                            />
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
                            className="flex-1 py-3 bg-[#2a2b2d] text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Update Item
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
