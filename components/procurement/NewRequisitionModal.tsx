'use client';

import { useState } from 'react';
import {
    X, Plus, Trash2, AlertTriangle,
    ChevronRight, Loader2, Calculator
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogLineItem, CatalogModal } from './CatalogModal';
import { useCreateRequisition } from '@/hooks/useRequisitions';
import { useBranch } from '@/hooks/useBranch';
import { useDepartments } from '@/hooks/useDepartments';
import { useBudgets } from '@/hooks/useBudgets';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import type { CreateRequisitionPayload } from '@/lib/api';
import { emitOnboardingAction } from '@/onboarding/helpers';

export function NewRequisitionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { branchId } = useBranch();
    const { format: f, symbol } = useCurrency();
    const { data: departments } = useDepartments(branchId);
    const { data: budgetData } = useBudgets(branchId);
    const createMutation = useCreateRequisition(branchId);

    const [lineItems, setLineItems] = useState<CatalogLineItem[]>([]);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        priority: 'Normal',
        departmentId: '',
        budgetId: '',
        deliveryDate: '',
        reason: '',
        fiscalYear: new Date().getFullYear().toString()
    });

    const totalCost = lineItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    // Find selected budget info
    const selectedBudget = (budgetData || []).find(b => b.id === formData.budgetId);
    const remainingBudget = selectedBudget ? Number(selectedBudget.remaining) - totalCost : 0;
    const isOverBudget = remainingBudget < 0;

    async function handleSubmit() {
        if (!formData.departmentId) return alert('Please select a department');
        if (lineItems.length === 0) return alert('Please add at least one item');

        const payload: CreateRequisitionPayload = {
            branchId,
            departmentId: formData.departmentId,
            budgetId: formData.budgetId || null,
            fiscalYear: formData.fiscalYear,
            priority: formData.priority,
            deliveryDate: formData.deliveryDate || null,
            reason: formData.reason,
            items: lineItems.map(item => ({
                inventoryItemId: item.id.toString(), // Assuming item.id is the inventoryItemId
                qty: item.qty,
                estimatedUnitPrice: item.price
            }))
        };

        try {
            await createMutation.mutateAsync(payload);
            emitOnboardingAction('create-requisition');
            onClose();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to submit requisition');
        }
    }

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
                            <p className="text-xs text-gray-500">Draft • {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={clsx("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", 
                                formData.priority === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>
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
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <div className="h-8 w-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm mr-3 shadow-lg">1</div>
                                Requirement Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Department</label>
                                    <select 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        value={formData.departmentId}
                                        onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                                    >
                                        <option value="">Select Department...</option>
                                        {(departments || []).map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Required Delivery Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-black transition-all" 
                                        value={formData.deliveryDate}
                                        onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority Level</label>
                                    <div className="flex gap-2">
                                        {['Normal', 'Planned', 'Emergency'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                className={clsx("flex-1 py-3 text-xs font-bold rounded-xl border transition-all",
                                                    formData.priority === p
                                                        ? (p === 'Emergency' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-gray-900 text-white border-gray-900 shadow-md')
                                                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reason for Request</label>
                                    <textarea 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 h-24 focus:ring-2 focus:ring-black transition-all" 
                                        placeholder="Explain why these items are needed..."
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. Item Lines */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <div className="h-8 w-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm mr-3 shadow-lg">2</div>
                                    Requested Items
                                </h3>
                                <Button
                                    onClick={() => setIsCatalogOpen(true)}
                                    className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Items
                                </Button>
                            </div>

                            <CatalogModal
                                isOpen={isCatalogOpen}
                                onClose={() => setIsCatalogOpen(false)}
                                onAddItems={(newItems) => setLineItems([...lineItems, ...newItems])}
                            />

                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Item Details</th>
                                            <th className="px-6 py-4 w-28 text-center">Qty</th>
                                            <th className="px-6 py-4 w-32 text-right">Est. Price</th>
                                            <th className="px-6 py-4 w-32 text-right">Total</th>
                                            <th className="px-6 py-4 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {lineItems.map((line, idx) => (
                                            <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">{line.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{line.sku} • {line.unit}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-center font-bold focus:ring-2 focus:ring-black transition-all"
                                                        value={line.qty}
                                                        onChange={(e) => {
                                                            const newItems = [...lineItems];
                                                            newItems[idx].qty = Math.max(0, parseInt(e.target.value) || 0);
                                                            setLineItems(newItems);
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="w-full bg-white border border-gray-200 rounded-lg pl-6 pr-2 py-2 text-right font-medium focus:ring-2 focus:ring-black transition-all"
                                                            value={line.price}
                                                            onChange={(e) => {
                                                                const newItems = [...lineItems];
                                                                newItems[idx].price = Math.max(0, parseFloat(e.target.value) || 0);
                                                                setLineItems(newItems);
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900">{f(line.price * line.qty)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}
                                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {lineItems.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-gray-300">
                                                        <Plus className="h-8 w-8 opacity-20" />
                                                        <p className="text-sm font-medium">No items added yet</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 3. Budget Control */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <div className="h-8 w-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm mr-3 shadow-lg">3</div>
                                Budget Allocation
                            </h3>
                            
                            <div className="mb-6">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cost Center / Budget Line</label>
                                <select 
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-black transition-all"
                                    value={formData.budgetId}
                                    onChange={e => setFormData({ ...formData, budgetId: e.target.value })}
                                >
                                    <option value="">Select Budget Line...</option>
                                    {(budgetData || []).map(b => (
                                        <option key={b.id} value={b.id}>{b.name} ({b.fiscalYear})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Estimated Total Cost</p>
                                    <p className="text-2xl font-black text-gray-900">{f(totalCost)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Status After Request</p>
                                    {formData.budgetId ? (
                                        <p className={clsx("text-2xl font-black", isOverBudget ? 'text-red-600' : 'text-green-600')}>
                                            {f(remainingBudget)}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-400 pt-2 font-medium italic">Select a budget to see impact</p>
                                    )}
                                </div>
                            </div>

                            {isOverBudget && (
                                <div className="mt-4 flex items-start gap-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                                    <AlertTriangle className="h-6 w-6 shrink-0" />
                                    <div>
                                        <span className="font-black text-xs uppercase tracking-tight">Budget Threshold Breached</span>
                                        <p className="text-sm mt-0.5 opacity-90">This request exceeds the available budget. It will require finance override approval.</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Actions */}
                        <div className="pb-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-10">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Calculator className="h-5 w-5" />
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-none">
                                    Standard Approval Flow: <span className="text-gray-900">Requestor → HOD → Finance</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Button 
                                    variant="ghost"
                                    onClick={onClose} 
                                    className="px-6 py-6 rounded-xl font-bold text-gray-500 hover:bg-gray-100 flex-1 md:flex-none"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSubmit}
                                    disabled={createMutation.isPending || lineItems.length === 0}
                                    className="px-10 py-6 rounded-xl bg-gray-900 text-white font-black text-sm shadow-xl hover:bg-gray-800 flex items-center justify-center gap-3 flex-1 md:flex-none transition-all group"
                                    data-tour="create-requisition-submit-btn"
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Submit Requisition
                                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
