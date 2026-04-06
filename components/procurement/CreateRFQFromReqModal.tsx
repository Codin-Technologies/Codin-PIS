'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Store, Send, Search, Users, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useBranch } from '@/hooks/useBranch';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreateRFQ } from '@/hooks/useRFQs';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import type { Requisition, CreateRFQPayload } from '@/lib/api';

interface CreateRFQFromReqModalProps {
    isOpen: boolean;
    onClose: () => void;
    requisition: Requisition;
    onSuccess: () => void;
}

export function CreateRFQFromReqModal({ isOpen, onClose, requisition, onSuccess }: CreateRFQFromReqModalProps) {
    const { branchId } = useBranch();
    const { format: f } = useCurrency();
    const createRFQMutation = useCreateRFQ(branchId);

    const [form, setForm] = useState({
        title: `RFQ for ${requisition.subject || requisition.requisitionNumber}`,
        category: 'Food & Beverage',
        paymentTerms: 'Net 30',
        requiredDelivery: requisition.deliveryDate || '',
        deadline: '',
    });

    const [searchSupplier, setSearchSupplier] = useState('');
    const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);

    const { data: supplierData, isLoading: isLoadingSuppliers } = useSuppliers(branchId, {
        search: searchSupplier || undefined
    });
    const suppliers = supplierData?.data ?? [];

    const toggleSupplier = (id: string) => {
        setSelectedSupplierIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handlePublish = () => {
        if (!form.title || selectedSupplierIds.length === 0) return;

        const payload: CreateRFQPayload = {
            branchId,
            requisitionId: requisition.id,
            title: form.title,
            category: form.category,
            paymentTerms: form.paymentTerms,
            requiredDelivery: form.requiredDelivery || undefined,
            deadline: form.deadline || undefined,
            supplierIds: selectedSupplierIds,
        };

        createRFQMutation.mutate(payload, {
            onSuccess: () => {
                onSuccess();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Create Request for Quotation</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Drafting RFQ from Requisition {requisition.requisitionNumber}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30">
                        {/* Reference Requisition Info */}
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Source Requisition</p>
                                <p className="font-bold text-blue-900">{requisition.subject}</p>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100 flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Approved Value</p>
                                    <p className="font-black text-gray-900 leading-none">{f(requisition.value)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Details */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                                <Store className="h-4 w-4 text-gray-400" />
                                RFQ Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">RFQ Title <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all" 
                                        value={form.title}
                                        onChange={e => setForm({...form, title: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                                        <select 
                                            className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                                            value={form.category}
                                            onChange={e => setForm({...form, category: e.target.value})}
                                        >
                                            <option>Food & Beverage</option>
                                            <option>Cleaning Supplies</option>
                                            <option>Equipment</option>
                                            <option>Services</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Payment Terms</label>
                                        <select 
                                            className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                                            value={form.paymentTerms}
                                            onChange={e => setForm({...form, paymentTerms: e.target.value})}
                                        >
                                            <option>Net 30</option>
                                            <option>Net 60</option>
                                            <option>Cash on Delivery</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Required Delivery</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input 
                                                type="date" 
                                                className="w-full border border-gray-200 pl-10 pr-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                                                value={form.requiredDelivery}
                                                onChange={e => setForm({...form, requiredDelivery: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Closing Deadline</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input 
                                                type="date" 
                                                className="w-full border border-gray-200 pl-10 pr-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                                                value={form.deadline}
                                                onChange={e => setForm({...form, deadline: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Invite Suppliers */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-72">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    Invite Suppliers <span className="text-red-500">*</span>
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{selectedSupplierIds.length} Selected</span>
                            </h3>

                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search entire supplier directory..." 
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                                    value={searchSupplier}
                                    onChange={e => setSearchSupplier(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-2 relative">
                                {isLoadingSuppliers && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    </div>
                                )}
                                {suppliers.map(sup => (
                                    <div 
                                        key={sup.id} 
                                        onClick={() => toggleSupplier(sup.id)}
                                        className={clsx(
                                            "p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all group",
                                            selectedSupplierIds.includes(sup.id) 
                                                ? 'border-black bg-gray-900 text-white shadow-md' 
                                                : 'border-gray-100 hover:border-gray-300 bg-gray-50'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-100">
                                                <Store className={clsx("h-4 w-4", selectedSupplierIds.includes(sup.id) ? "text-gray-900" : "text-gray-400")} />
                                            </div>
                                            <div>
                                                <p className={clsx("text-sm font-bold", selectedSupplierIds.includes(sup.id) ? 'text-white' : 'text-gray-900')}>{sup.name}</p>
                                                <p className={clsx("text-[10px] uppercase font-bold tracking-widest mt-0.5", selectedSupplierIds.includes(sup.id) ? 'text-gray-400' : 'text-gray-500')}>{sup.category}</p>
                                            </div>
                                        </div>
                                        <div className={clsx("h-5 w-5 rounded-full border flex items-center justify-center",
                                            selectedSupplierIds.includes(sup.id) ? "border-white bg-white text-black" : "border-gray-300 text-transparent"
                                        )}>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                                {suppliers.length === 0 && !isLoadingSuppliers && (
                                     <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
                                         <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                                         <p className="text-sm">No suppliers found.</p>
                                     </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
                        <Button 
                            variant="outline" 
                            onClick={onClose} 
                            className="rounded-xl font-bold bg-white"
                            disabled={createRFQMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handlePublish}
                            disabled={!form.title || selectedSupplierIds.length === 0 || createRFQMutation.isPending}
                            className="bg-[#2a2b2d] hover:bg-black text-white rounded-xl font-bold px-6 flex items-center gap-2 transition-all shadow-md"
                        >
                            {createRFQMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            Broadcast RFQ
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
