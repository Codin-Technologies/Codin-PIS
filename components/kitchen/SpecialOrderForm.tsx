'use client';

import { X, Send, AlertCircle, Clock, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranch } from '@/hooks/useBranch';
import { useCreateSpecialOrder } from '@/hooks/useKitchen';

interface SpecialOrderFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SpecialOrderForm({ isOpen, onClose }: SpecialOrderFormProps) {
    const { branchId } = useBranch();
    const createSpecialOrderMutation = useCreateSpecialOrder(branchId);

    const [formData, setFormData] = useState({
        requestName: '',
        preparationNotes: '',
        priorityLevel: 'Normal',
        logTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createSpecialOrderMutation.mutate(formData, {
            onSuccess: () => {
                setFormData({ 
                    requestName: '', 
                    preparationNotes: '', 
                    priorityLevel: 'Normal', 
                    logTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                });
                onClose();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Record Special Order</h2>
                            <p className="text-sm text-gray-500">Log requests outside planned menu</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Request Name *</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none bg-gray-50"
                                placeholder="e.g. Gluten-Free Pasta, VIP Preference"
                                value={formData.requestName}
                                onChange={(e) => setFormData({ ...formData, requestName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preparation Notes</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none bg-gray-50"
                                placeholder="Any specific instructions for the chef..."
                                value={formData.preparationNotes}
                                onChange={(e) => setFormData({ ...formData, preparationNotes: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority Level</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none bg-gray-50"
                                    value={formData.priorityLevel}
                                    onChange={(e) => setFormData({ ...formData, priorityLevel: e.target.value })}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="High">High Priority</option>
                                    <option value="Critical">Critical (Allergy/VIP)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Log Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none bg-gray-50"
                                        value={formData.logTime}
                                        onChange={(e) => setFormData({ ...formData, logTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                             <button
                                type="submit"
                                disabled={createSpecialOrderMutation.isPending}
                                className="flex-1 py-3 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {createSpecialOrderMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Post to Kitchen
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
