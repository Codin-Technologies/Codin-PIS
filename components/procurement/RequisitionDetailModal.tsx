'use client';

import {
    X, CheckCircle, XCircle, Clock, FileText,
    MessageSquare, ChevronRight, Store, Calendar,
    ShieldCheck, AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function RequisitionDetailModal({
    requisition,
    isOpen,
    onClose,
    onApprove,
    onReject
}: {
    requisition: any;
    isOpen: boolean;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
}) {
    if (!isOpen || !requisition) return null;

    const [comment, setComment] = useState('');

    // Mock Timeline Data based on status
    const steps = [
        { label: 'Submitted', date: requisition.date, status: 'completed', user: requisition.requestedBy },
        { label: 'Dept. Approval', date: 'Today', status: requisition.status === 'Pending' ? 'current' : (requisition.status === 'Rejected' ? 'rejected' : 'completed'), user: 'Kelvin (You)' },
        { label: 'Finance Review', date: '-', status: 'upcoming', user: 'Finance Team' },
        { label: 'PO Created', date: '-', status: 'upcoming', user: 'System' },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900">{requisition.subject}</h2>
                                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border",
                                    requisition.status === 'Pending' ? "bg-orange-50 text-orange-700 border-orange-200" :
                                        requisition.status === 'Approved' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            requisition.status === 'Rejected' ? "bg-red-50 text-red-700 border-red-200" :
                                                "bg-green-50 text-green-700 border-green-200"
                                )}>
                                    {requisition.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{requisition.id} • Created on {requisition.date}</p>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-200 transition-colors">
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT: Details & Items */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Key Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Store className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Department</p>
                                        <p className="font-bold text-gray-900">{requisition.dept}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Required By</p>
                                        <p className="font-bold text-gray-900">2026-01-25</p>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700 text-sm">Line Items</h3>
                                    <span className="text-xs font-bold text-gray-500">3 Items</span>
                                </div>
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 bg-white border-b border-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Item</th>
                                            <th className="px-6 py-3 font-medium text-center">Qty</th>
                                            <th className="px-6 py-3 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {/* Mock Items based on Subject */}
                                        <tr className="bg-white">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{requisition.subject}</p>
                                                <p className="text-xs text-gray-400">SKU-99281 • Primary Vendor</p>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">20 kg</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">${requisition.value.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={2} className="px-6 py-3 text-right font-bold text-gray-600">Total Value</td>
                                            <td className="px-6 py-3 text-right font-bold text-xl text-gray-900">${requisition.value.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Reason */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Reason for Request</h4>
                                <p className="text-sm text-gray-700 italic">"Items required for the upcoming weekend event. Stock levels are currently below safety threshold due to unexpected demand yesterday."</p>
                            </div>
                        </div>

                        {/* RIGHT: Approval Flow & Actions */}
                        <div className="space-y-6">

                            {/* Workflow Timeline */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6">Approval Workflow</h3>
                                <div className="space-y-6 relative">
                                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>

                                    {steps.map((step, idx) => (
                                        <div key={idx} className="relative flex gap-4">
                                            <div className={clsx("relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2",
                                                step.status === 'completed' ? "bg-green-100 border-green-500 text-green-600" :
                                                    step.status === 'current' ? "bg-blue-100 border-blue-500 text-blue-600 animate-pulse" :
                                                        step.status === 'rejected' ? "bg-red-100 border-red-500 text-red-600" :
                                                            "bg-white border-gray-200 text-gray-300"
                                            )}>
                                                {step.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                                                    step.status === 'rejected' ? <XCircle className="h-4 w-4" /> :
                                                        step.status === 'current' ? <Clock className="h-4 w-4" /> :
                                                            <div className="h-2 w-2 rounded-full bg-gray-200" />}
                                            </div>
                                            <div>
                                                <p className={clsx("text-sm font-bold", step.status === 'upcoming' ? "text-gray-400" : "text-gray-900")}>{step.label}</p>
                                                <p className="text-xs text-gray-500">{step.user}</p>
                                                {step.date !== '-' && <p className="text-[10px] text-gray-400 mt-0.5">{step.date}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions (Only if Pending) */}
                            {requisition.status === 'Pending' && (
                                <div className="bg-white p-6 rounded-2xl border-t-4 border-t-purple-500 shadow-sm border-x border-b border-gray-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ShieldCheck className="h-5 w-5 text-purple-600" />
                                        <h3 className="font-bold text-gray-900">Your Action Required</h3>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">
                                        You have permission to approve this request (Spending Limit: $5,000).
                                    </p>

                                    <div className="space-y-3">
                                        <textarea
                                            placeholder="Optional comment..."
                                            className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            rows={2}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={onReject}
                                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject
                                            </button>
                                            <button
                                                onClick={onApprove}
                                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 shadow-md transition-colors"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
