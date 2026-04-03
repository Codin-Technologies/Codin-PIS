'use client';

import {
    X, CheckCircle, XCircle, Clock, FileText,
    Store, Calendar, Loader2, AlertCircle, Info
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { requisitionStatusLabel } from '@/lib/procurement/requisition-status';
import { useRequisition, useUpdateRequisitionStatus } from '@/hooks/useRequisitions';
import { useBranch } from '@/hooks/useBranch';
import { Button } from '@/components/ui/button';

export function RequisitionDetailModal({
    requisitionId,
    isOpen,
    onClose,
}: {
    requisitionId: string | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const { branchId } = useBranch();
    const { data: requisition, isLoading, isError } = useRequisition(requisitionId || '');
    const updateStatusMutation = useUpdateRequisitionStatus(branchId);
    const [comment, setComment] = useState('');

    if (!isOpen || !requisitionId) return null;

    const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
        try {
            await updateStatusMutation.mutateAsync({ id: requisitionId, status });
            onClose();
        } catch (e) {
            console.error(e);
        }
    };

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
                            {isLoading ? (
                                <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-gray-900">{requisition?.subject || 'Requisition Detail'}</h2>
                                        {requisition && (
                                            <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border",
                                                requisition.status === 'pending' ? "bg-orange-50 text-orange-700 border-orange-200" :
                                                requisition.status === 'approved' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                requisition.status === 'rejected' ? "bg-red-50 text-red-700 border-red-200" :
                                                "bg-green-50 text-green-700 border-green-200"
                                            )}>
                                                {requisitionStatusLabel(requisition.status)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{requisition?.requisitionNumber || requisitionId} • Created on {requisition?.date || '...'}</p>
                                </>
                            )}
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-200 transition-colors">
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-10 w-10 text-gray-300 animate-spin" />
                                <p className="text-gray-400 font-medium font-sans">Fetching line items...</p>
                            </div>
                        ) : isError ? (
                            <div className="py-20 text-center">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">Failed to load requisition</h3>
                                <p className="text-gray-500">The requisition could not be retrieved. Please try again.</p>
                            </div>
                        ) : requisition ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* LEFT: Details & Items */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Store className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Department</p>
                                                <p className="font-bold text-gray-900">{requisition.dept}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Required By</p>
                                                <p className="font-bold text-gray-900">{requisition.deliveryDate || 'Not Specified'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line Items */}
                                    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-700 text-sm">Line Items</h3>
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{requisition.items?.length || 0} Items</span>
                                        </div>
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-[10px] text-gray-400 bg-gray-50/30 font-bold uppercase tracking-widest border-b border-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3">Item Description</th>
                                                    <th className="px-6 py-3 font-medium text-center">Quantity</th>
                                                    <th className="px-6 py-3 font-medium text-right">Est. Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {requisition.items?.map((item, idx) => (
                                                    <tr key={idx} className="bg-white">
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-gray-900">{item.name}</p>
                                                            <p className="text-[11px] text-gray-400">Inventory ID: {item.inventoryItemId?.split('-')[0] || 'N/A'}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="font-bold text-gray-900">{item.qty}</span>
                                                            <span className="text-gray-400 ml-1 font-medium">{item.unit}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                            ${(item.estimatedPrice * item.qty).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50/50">
                                                <tr>
                                                    <td colSpan={2} className="px-6 py-4 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Total Estimated Value</td>
                                                    <td className="px-6 py-4 text-right font-black text-lg text-gray-900">
                                                        ${requisition.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Reason */}
                                    <div className="bg-orange-50/30 rounded-2xl p-6 border border-orange-100/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Info className="h-4 w-4 text-orange-500" />
                                            <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Reason for Request</h4>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed italic">
                                            {requisition.reason ? `"${requisition.reason}"` : "No specific reason provided for this request."}
                                        </p>
                                    </div>
                                </div>

                                {/* RIGHT: Approval Flow & Actions */}
                                <div className="space-y-6">
                                    {/* Workflow Timeline */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <FileText className="h-16 w-16" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-6">Approval Flow</h3>
                                        <div className="space-y-6 relative">
                                            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                                            
                                            <div className="relative flex gap-4">
                                                <div className="relative z-10 w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Submitted</p>
                                                    <p className="text-[11px] text-gray-500">{requisition.requestedBy}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{requisition.date}</p>
                                                </div>
                                            </div>

                                            <div className="relative flex gap-4">
                                                <div className={clsx("relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2",
                                                    requisition.status === 'pending' || requisition.status === 'in_review' ? "bg-blue-50 border-blue-500 text-blue-600 animate-pulse" :
                                                    requisition.status === 'approved' ? "bg-green-100 border-green-500 text-green-600" :
                                                    requisition.status === 'rejected' ? "bg-red-50 border-red-500 text-red-600" :
                                                    "bg-white border-gray-200 text-gray-300"
                                                )}>
                                                    {requisition.status === 'approved' ? <CheckCircle className="h-4 w-4" /> :
                                                     requisition.status === 'rejected' ? <XCircle className="h-4 w-4" /> :
                                                     <Clock className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className={clsx("text-sm font-bold", requisition.status === 'pending' ? "text-gray-900" : "text-gray-400 uppercase tracking-tight")}>
                                                        {requisition.status === 'rejected' ? 'Rejected' : requisition.status === 'approved' ? 'Approved' : 'Awaiting Review'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">Procurement Team</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions (Only if Pending) */}
                                    {(requisition.status === 'pending' || requisition.status === 'in_review') && (
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl ring-1 ring-black/5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="p-1.5 bg-purple-50 rounded-lg">
                                                    <CheckCircle className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <h3 className="font-bold text-gray-900">Review Required</h3>
                                            </div>
                                            <p className="text-[11px] text-gray-400 mb-6 leading-relaxed">
                                                Please review the items and estimated costs above. You can provide an optional comment before acting on this request.
                                            </p>

                                            <div className="space-y-4">
                                                <textarea
                                                    placeholder="Add a reason or comment..."
                                                    className="w-full text-sm border border-gray-100 bg-gray-50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                                    rows={3}
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => handleStatusUpdate('approved')}
                                                        disabled={updateStatusMutation.isPending}
                                                        className="w-full py-6 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                        Approve Requisition
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleStatusUpdate('rejected')}
                                                        disabled={updateStatusMutation.isPending}
                                                        variant="ghost"
                                                        className="w-full py-4 rounded-xl border border-gray-100 text-red-600 font-bold text-xs hover:bg-red-50 hover:text-red-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
