'use client';

import { 
    X, Building2, MapPin, Star, ShieldCheck, 
    FileText, Clock, CheckCircle2, AlertCircle, 
    TrendingUp, DollarSign, Mail, Phone, Globe,
    ArrowRight, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useRFQs } from '@/hooks/useRFQs';
import { useBranch } from '@/hooks/useBranch';
import { useCurrency } from '@/hooks/useCurrency';
import type { Supplier } from '@/lib/api';

interface SupplierDetailModalProps {
    supplier: Supplier | null;
    isOpen: boolean;
    onClose: () => void;
}

export function SupplierDetailModal({ supplier, isOpen, onClose }: SupplierDetailModalProps) {
    const { branchId } = useBranch();
    const { format: f } = useCurrency();
    const { data: rfqData, isLoading: isLoadingRFQs } = useRFQs(branchId);

    if (!supplier) return null;

    const supplierRFQs = (rfqData?.data || []).filter(rfq => 
        rfq.supplierIds?.includes(supplier.id)
    );

    // Mock response data generator based on RFQ status and supplier ID
    const getMockResponse = (rfqId: string) => {
        const hash = rfqId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
        const states = ['Submitted', 'Awaiting Quote', 'Declined', 'Draft'];
        const state = states[Math.abs(hash) % states.length];
        
        if (state === 'Submitted') {
            const baseValue = 5000 + (Math.abs(hash) % 15000);
            return {
                status: 'Submitted',
                value: baseValue,
                leadTime: (Math.abs(hash) % 10) + 3 + ' days',
                date: new Date(Date.now() - (Math.abs(hash) % 86400000 * 5)).toLocaleDateString()
            };
        }
        return { status: state };
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-2xl bg-[#f8f9fa] shadow-2xl h-full overflow-hidden flex flex-col"
                    >
                        {/* Header Section */}
                        <div className="bg-white border-b border-gray-100 p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                                    <span className="text-2xl font-bold text-gray-400">{supplier.name.charAt(0)}</span>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{supplier.name}</h2>
                                {supplier.status === 'Active' && (
                                    <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                        Preferred Partner
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                                <span className="flex items-center gap-1.5 font-medium"><Building2 className="h-4 w-4 text-gray-400" /> {supplier.category}</span>
                                <span className="flex items-center gap-1.5 font-medium"><MapPin className="h-4 w-4 text-gray-400" /> {supplier.location}</span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> 
                                    <span className="text-gray-900 font-bold">{supplier.rating}</span> 
                                    <span className="text-gray-400">Score</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Spend</p>
                                    <p className="text-lg font-black text-gray-900">{f(supplier.spend)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Reliability</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 rounded-full" 
                                                style={{ width: `${supplier.reliability}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{supplier.reliability}%</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Recent RFQs</p>
                                    <p className="text-lg font-black text-gray-900">{supplierRFQs.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Contact Info */}
                            <section>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldCheck className="h-3 text-blue-400" />
                                    Business Profile
                                </h3>
                                <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-sm">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-gray-300" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Email</p>
                                                <p className="text-gray-900 font-medium">contact@{supplier.name.toLowerCase().replace(/\s/g, '')}.com</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-gray-300" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Phone</p>
                                                <p className="text-gray-900 font-medium">+255 784 000 000</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4 text-gray-300" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Website</p>
                                                <p className="text-gray-900 font-medium">www.{supplier.name.toLowerCase().replace(/\s/g, '')}.com</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="h-4 w-4 text-gray-300" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Growth</p>
                                                <p className="text-emerald-600 font-bold">+12.5% YoY</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* RFQ Activity */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="h-3 text-orange-400" />
                                        Sourcing Activity
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{supplierRFQs.length} total events</span>
                                </div>

                                <div className="space-y-3">
                                    {isLoadingRFQs ? (
                                        <div className="text-center py-12">
                                            <Clock className="h-8 w-8 text-gray-200 animate-spin mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Loading sourcing history...</p>
                                        </div>
                                    ) : supplierRFQs.length === 0 ? (
                                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                            <FileText className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No RFQs sent to this supplier yet.</p>
                                        </div>
                                    ) : (
                                        supplierRFQs.map(rfq => {
                                            const response = getMockResponse(rfq.id);
                                            return (
                                                <div key={rfq.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-gray-300 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={clsx(
                                                            "h-10 w-10 rounded-xl flex items-center justify-center",
                                                            rfq.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                                                        )}>
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-gray-900">{rfq.title}</p>
                                                                <span className={clsx(
                                                                    "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter",
                                                                    rfq.status === 'active' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                                                                )}>{rfq.status}</span>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 mt-0.5">{rfq.rfqNumber} • Sent on {new Date(rfq.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        {response.status === 'Submitted' ? (
                                                            <div>
                                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-end gap-1">
                                                                    <CheckCircle2 className="h-3 w-3" /> Submitted
                                                                </p>
                                                                <p className="text-sm font-black text-gray-900 mt-1">{f(response.value!)}</p>
                                                                <p className="text-[9px] text-gray-400 mt-0.5">Lead time: {response.leadTime}</p>
                                                            </div>
                                                        ) : response.status === 'Awaiting Quote' ? (
                                                            <div>
                                                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center justify-end gap-1">
                                                                    <Clock className="h-3 w-3" /> Awaiting Quote
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 mt-1">Due in 2 days</p>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-gray-400 opacity-50">
                                                                <p className="text-[10px] font-bold uppercase tracking-widest">{response.status}</p>
                                                                <AlertCircle className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-white border-t border-gray-100 p-6 flex justify-between items-center gap-4">
                            <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                                <ExternalLink className="h-4 w-4" />
                                Full Audit History
                            </button>
                            <div className="flex gap-3">
                                <button className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                    Send Email
                                </button>
                                <button className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-colors shadow-lg shadow-black/10 flex items-center gap-2">
                                    Download Profile
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
