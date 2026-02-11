'use client';

import { useState } from 'react';
import {
    X, Plus, Trash2, Upload, AlertTriangle, FileText,
    ChevronRight, CheckCircle, Info, Calculator
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogModal } from './CatalogModal';

// Mock Data for "System Intelligence"
const MOCK_ITEMS = [
    { id: 1, sku: 'BEEF-001', name: 'Premium Beef Cuts', unit: 'kg', price: 18.50, stock: 12, forecast: 45, daysCover: 2 },
    { id: 2, sku: 'TOM-099', name: 'Tomato Paste (Canned)', unit: 'can', price: 4.20, stock: 5, forecast: 20, daysCover: 1 },
    { id: 3, sku: 'WINE-RED', name: 'House Red Wine', unit: 'btl', price: 12.00, stock: 24, forecast: 10, daysCover: 14 },
];

export function NewRequisitionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        priority: 'Normal',
        dept: 'Kitchen',
        deliveryDate: '',
        reason: '',
        costCenter: 'CC-001 - Kitchen Ops'
    });

    const addItem = (item: any) => {
        setLineItems([...lineItems, { ...item, qty: 0, requiredBy: '' }]);
    };

    const totalCost = lineItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const budgetLimit = 5000;
    const remainingBudget = budgetLimit - totalCost;
    const isOverBudget = remainingBudget < 0;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    className="h-full w-full max-w-4xl bg-[#f8f9fc] shadow-2xl overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-8 py-5 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">New Requisition</h2>
                            <p className="text-xs text-gray-500">REQ-{Math.floor(Math.random() * 10000)} • {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", formData.priority === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>
                                {formData.priority}
                            </span>
                            <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                                <X className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">

                        {/* 1. Requirement Details */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs mr-2">1</div>
                                Requirement Details
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Requested By</label>
                                    <input type="text" value="Kelvin (Outlet Mgr)" disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-black focus:border-transparent">
                                        <option>Kitchen</option>
                                        <option>Bar</option>
                                        <option>Housekeeping</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                                    <div className="flex space-x-2">
                                        {['Normal', 'Planned', 'Emergency'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                className={clsx("flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                                                    formData.priority === p
                                                        ? (p === 'Emergency' ? 'bg-red-500 text-white border-red-600' : 'bg-black text-white border-black')
                                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Required Delivery</label>
                                    <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason for Request</label>
                                    <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 h-20" placeholder="e.g., Weekly restock for weekend service..."></textarea>
                                </div>
                            </div>
                        </section>

                        {/* 2. Item Lines */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs mr-2">2</div>
                                    Item Lines
                                </div>
                                <button
                                    onClick={() => setIsCatalogOpen(true)}
                                    className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg"
                                >
                                    + Add From Catalog
                                </button>
                            </h3>

                            <CatalogModal
                                isOpen={isCatalogOpen}
                                onClose={() => setIsCatalogOpen(false)}
                                onAddItems={(newItems) => setLineItems([...lineItems, ...newItems])}
                            />

                            {/* Quick Add Placeholder */}
                            <div className="mb-4 flex gap-2">
                                <select className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" onChange={(e) => {
                                    const item = MOCK_ITEMS.find(i => i.id.toString() === e.target.value);
                                    if (item) addItem(item);
                                }}>
                                    <option value="">Quick Add Item...</option>
                                    {MOCK_ITEMS.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                                </select>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Item Details</th>
                                            <th className="px-4 py-3">Stock Intel</th>
                                            <th className="px-4 py-3 w-24">Qty</th>
                                            <th className="px-4 py-3 w-32">Unit Price</th>
                                            <th className="px-4 py-3 w-32">Total</th>
                                            <th className="px-4 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {lineItems.map((line, idx) => (
                                            <tr key={idx} className="group hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-gray-900">{line.name}</p>
                                                    <p className="text-xs text-gray-500">{line.sku} • {line.unit}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-4 text-xs">
                                                        <div>
                                                            <span className="block text-gray-400">On Hand</span>
                                                            <span className={clsx("font-bold", line.stock < 5 ? 'text-red-600' : 'text-gray-900')}>{line.stock}</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-gray-400">Forecast</span>
                                                            <span className="font-bold text-gray-900">{line.forecast}</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-gray-400">Cover</span>
                                                            <span className={clsx("font-bold", line.daysCover < 3 ? 'text-red-600' : 'text-green-600')}>{line.daysCover} days</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-center font-bold"
                                                        value={line.qty}
                                                        onChange={(e) => {
                                                            const newItems = [...lineItems];
                                                            newItems[idx].qty = parseInt(e.target.value) || 0;
                                                            setLineItems(newItems);
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">${line.price.toFixed(2)}</td>
                                                <td className="px-4 py-3 font-bold text-gray-900">${(line.price * line.qty).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {lineItems.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">No items added yet. Search above to add.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 3. Cost & Budget */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs mr-2">3</div>
                                Cost & Budget Control
                            </h3>
                            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Cost Center</p>
                                    <p className="font-bold text-gray-900">CC-001 • Kitchen Ops</p>
                                </div>
                                <div className="w-px h-10 bg-gray-200"></div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Estimated Cost</p>
                                    <p className="text-xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
                                </div>
                                <div className="w-px h-10 bg-gray-200"></div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Remaining Budget</p>
                                    <p className={clsx("text-xl font-bold", isOverBudget ? 'text-red-600' : 'text-green-600')}>
                                        ${remainingBudget.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            {isOverBudget && (
                                <div className="mt-3 flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                                    <AlertTriangle className="h-5 w-5 shrink-0" />
                                    <div>
                                        <span className="font-bold">Budget Exceeded!</span>
                                        <p>This requisition exceeds the monthly budget. It will require overriding approval from Finance.</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 4. Risk & Compliance */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs mr-2">4</div>
                                Risk & Compliance
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-green-100 bg-green-50">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-sm font-medium text-gray-900">Supplier Contracts Valid</span>
                                    </div>
                                    <span className="text-xs text-green-700 bg-white px-2 py-1 rounded border border-green-200">Pass</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-100 bg-yellow-50">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                        <span className="text-sm font-medium text-gray-900">Food Safety: Temperature Check Required</span>
                                    </div>
                                    <span className="text-xs text-yellow-700 bg-white px-2 py-1 rounded border border-yellow-200">Warning</span>
                                </div>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="pb-10 pt-4 flex items-center justify-end gap-4">
                            <div className="text-right mr-4">
                                <p className="text-xs text-gray-500">Approvers: Outlet Mgr → Ops Mgr → Finance</p>
                            </div>
                            <button onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50">
                                Save Draft
                            </button>
                            <button onClick={() => {
                                alert('Requisition Submitted for Approval!');
                                onClose();
                            }} className="px-8 py-3 rounded-xl bg-[#2a2b2d] font-bold text-white shadow-lg hover:bg-gray-800 flex items-center gap-2">
                                Submit Request
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
