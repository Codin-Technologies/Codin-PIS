'use client';

import { useState, useEffect } from 'react';
import {
    X, CheckCircle, Clock, Link as LinkIcon,
    Send, AlertCircle, FileText, ChevronRight,
    Search, Calendar, Mail, Copy, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranch } from '@/hooks/useBranch';
import { useRequisitions } from '@/hooks/useRequisitions';
import type { Supplier, Requisition } from '@/lib/api';

interface SendRFQModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSuppliers: Supplier[];
    onSuccess: () => void;
}

type Step = 'CONFIGURE' | 'SENDING' | 'SUCCESS';

export function SendRFQModal({ isOpen, onClose, selectedSuppliers, onSuccess }: SendRFQModalProps) {
    const { branchId } = useBranch();
    const [step, setStep] = useState<Step>('CONFIGURE');
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [selectedReqId, setSelectedReqId] = useState<string>('');
    const [sendingProgress, setSendingProgress] = useState<Record<string, 'pending' | 'sending' | 'sent'>>({});
    const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({});

    const { data: reqData } = useRequisitions(branchId, { status: 'Approved' });
    const approvedRequisitions = reqData?.data ?? [];

    // Reset state when closing/opening
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('CONFIGURE');
                setTitle('');
                setDeadline('');
                setSelectedReqId('');
                setSendingProgress({});
            }, 300);
        }
    }, [isOpen]);

    const handlePublish = async () => {
        if (!selectedReqId || !title || !deadline) return;

        setStep('SENDING');
        
        // Initialize progress
        const initialProgress: Record<string, 'pending' | 'sending' | 'sent'> = {};
        selectedSuppliers.forEach(s => initialProgress[s.id] = 'pending');
        setSendingProgress(initialProgress);

        // Simulate sending for each supplier
        for (const supplier of selectedSuppliers) {
            setSendingProgress(prev => ({ ...prev, [supplier.id]: 'sending' }));
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
            
            const rfqId = `RFQ-${Math.floor(1000 + Math.random() * 9000)}`;
            const link = `https://pis.app/rfq/fill/${rfqId}/${supplier.id}`;
            
            setGeneratedLinks(prev => ({ ...prev, [supplier.id]: link }));
            setSendingProgress(prev => ({ ...prev, [supplier.id]: 'sent' }));
        }

        setStep('SUCCESS');
        onSuccess();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Link copied to clipboard!');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Send Quotation Request</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {step === 'CONFIGURE' && `Inviting ${selectedSuppliers.length} suppliers to bid`}
                            {step === 'SENDING' && `Broadcasting RFQ to suppliers...`}
                            {step === 'SUCCESS' && `RFQ Published successfully`}
                        </p>
                    </div>
                    {step !== 'SENDING' && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        {step === 'CONFIGURE' && (
                            <motion.div
                                key="configure"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Selected Suppliers Mini List */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Recipients ({selectedSuppliers.length})</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSuppliers.map(s => (
                                            <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700">
                                                <div className="h-4 w-4 rounded bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                                                    {s.name.charAt(0)}
                                                </div>
                                                {s.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">RFQ Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="e.g. Q4 Packaging Supplies Sourcing"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Source Requisition (Items)</label>
                                        <div className="relative">
                                            <select
                                                value={selectedReqId}
                                                onChange={e => setSelectedReqId(e.target.value)}
                                                className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm bg-white pr-10"
                                            >
                                                <option value="">Select an Approved Requisition</option>
                                                {approvedRequisitions.map(req => (
                                                    <option key={req.id} value={req.id}>
                                                        {req.id} - {req.subject} (${req.value.toLocaleString()})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Closing Deadline</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                                            <input
                                                type="date"
                                                value={deadline}
                                                onChange={e => setDeadline(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        Generating an RFQ will create unique submission tokens for each selected supplier. They will receive an email invitation to fill out the digital quotation form.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'SENDING' && (
                            <motion.div
                                key="sending"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-12 space-y-8"
                            >
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="h-20 w-20 relative mb-6">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 rounded-full border-4 border-gray-100 border-t-black"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Send className="h-8 w-8 text-black" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Broadcasting Quotation Requests</h3>
                                    <p className="text-sm text-gray-500 mt-2">Connecting with {selectedSuppliers.length} supplier portals...</p>
                                </div>

                                <div className="space-y-3 max-w-md mx-auto">
                                    {selectedSuppliers.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{s.name}</span>
                                            </div>
                                            {sendingProgress[s.id] === 'sent' ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : sendingProgress[s.id] === 'sending' ? (
                                                <Loader2 className="h-5 w-5 text-black animate-spin" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-gray-200" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 'SUCCESS' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-6 space-y-8"
                            >
                                <div className="text-center">
                                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-10 w-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">RFQ Published!</h3>
                                    <p className="text-sm text-gray-500 mt-2">Invitations have been dispatched to all portals.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Supplier Quotation Links</label>
                                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded italic">Click to copy URL</span>
                                    </div>
                                    <div className="space-y-2">
                                        {selectedSuppliers.map(s => (
                                            <div key={s.id} className="group relative flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-black transition-all shadow-sm">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900">{s.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono mt-1 max-w-[300px] truncate">{generatedLinks[s.id]}</p>
                                                </div>
                                                <button 
                                                    onClick={() => copyToClipboard(generatedLinks[s.id])}
                                                    className="p-2.5 bg-gray-50 hover:bg-black hover:text-white rounded-xl transition-all"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                                    <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 italic">Auto-Evaluation Active</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            As suppliers fill their forms, the system will automatically rank responses based on Price, Quality, and Lead Time. Check the <span className="font-bold text-black">RFQ Summary</span> dashboard for real-time comparison.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                    {step === 'CONFIGURE' && (
                        <>
                            <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white transition-colors">
                                Discard Draft
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={!selectedReqId || !title || !deadline}
                                className={clsx(
                                    "flex-1 py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                                    (!selectedReqId || !title || !deadline) ? "bg-gray-300 cursor-not-allowed" : "bg-[#2a2b2d] hover:bg-black"
                                )}
                            >
                                <Send className="h-4 w-4" />
                                Publish & Send RFQ
                            </button>
                        </>
                    )}
                    {step === 'SUCCESS' && (
                        <button onClick={onClose} className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg">
                            Done
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
