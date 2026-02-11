'use client';

import { useState } from 'react';
import {
    X, Plus, Trash2, Save, FileText,
    ChevronRight, CheckCircle, AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const MOCK_ITEMS = [
    { id: '1', name: 'Tomato', uom: 'kg', stock: 50 },
    { id: '2', name: 'Flour', uom: 'kg', stock: 120 },
    { id: '3', name: 'Milk', uom: 'l', stock: 24 },
    { id: '4', name: 'Beef', uom: 'kg', stock: 15 },
    { id: '5', name: 'Eggs', uom: 'tray', stock: 8 },
];

interface NewUsageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export function NewUsageModal({ isOpen, onClose, onSubmit }: NewUsageModalProps) {
    const [lineItems, setLineItems] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        reason: 'Waste',
        notes: ''
    });

    const addItem = (item: any) => {
        if (!lineItems.find(i => i.id === item.id)) {
            setLineItems([...lineItems, { ...item, qty: 0 }]);
        }
    };

    const handleSave = () => {
        if (lineItems.length === 0) return;
        onSubmit({
            ...formData,
            items: lineItems
        });
        onClose();
        setLineItems([]);
        setFormData({ date: new Date().toISOString().split('T')[0], reason: 'Waste', notes: '' });
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
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
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
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 h-20"
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
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                    onChange={(e) => {
                                        const item = MOCK_ITEMS.find(i => i.id === e.target.value);
                                        if (item) {
                                            addItem(item);
                                            e.target.value = ""; // Reset select
                                        }
                                    }}
                                >
                                    <option value="">+ Add Item to List...</option>
                                    {MOCK_ITEMS.map(i => <option key={i.id} value={i.id}>{i.name} ({i.stock} {i.uom} on hand)</option>)}
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
                                                    <p className="text-xs text-gray-500">{line.uom} • Stock: {line.stock}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-center font-bold"
                                                        value={line.qty}
                                                        onChange={(e) => {
                                                            const newItems = [...lineItems];
                                                            newItems[idx].qty = parseFloat(e.target.value) || 0;
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
                            <button onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={lineItems.length === 0}
                                className="px-8 py-3 rounded-xl bg-[#2a2b2d] font-bold text-white shadow-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-4 w-4" />
                                Save Record
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
