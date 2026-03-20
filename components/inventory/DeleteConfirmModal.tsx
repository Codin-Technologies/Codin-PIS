'use client';

import { X, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { InventoryItem } from '@/lib/api';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string) => void;
    item: InventoryItem | null;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, item }: DeleteConfirmModalProps) {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
            >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Item?</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(item.id);
                        }}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg"
                    >
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
