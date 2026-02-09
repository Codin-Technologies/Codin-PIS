'use client';

import { useState } from 'react';
import { Shield, Lock, CheckCircle2, MoreVertical, Plus } from 'lucide-react';
import { CreateRoleForm } from './CreateRoleForm';
import { AnimatePresence, motion } from 'framer-motion';

const initialRoles = [
    { id: 1, name: 'Super Admin', permissions: 'Full access to all modules', users: 2 },
    { id: 2, name: 'Procurement Manager', permissions: 'Manage RFQs, POs, and Suppliers', users: 5 },
    { id: 3, name: 'Kitchen Lead', permissions: 'Manage stocks and kitchen inventory', users: 12 },
    { id: 4, name: 'Branch Manager', permissions: 'View reports and manage local staff', users: 8 },
];

export function RoleManagement() {
    const [roles, setRoles] = useState(initialRoles);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddRole = (role: any) => {
        setRoles([role, ...roles]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">System Roles</h3>
                    <p className="text-gray-500 text-sm">Define and manage user permissions and access levels.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4 text-pink-500" />
                    Create Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                    <div key={role.id} className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:border-pink-500/30 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-pink-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{role.name}</h4>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                                        {role.users} Users Assigned
                                    </p>
                                </div>
                            </div>
                            <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Lock className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-600 leading-relaxed">{role.permissions}</p>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <span className="text-[10px] text-green-600 uppercase tracking-widest font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> System Verified
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Role Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                        >
                            <CreateRoleForm
                                onClose={() => setIsModalOpen(false)}
                                onSuccess={handleAddRole}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
