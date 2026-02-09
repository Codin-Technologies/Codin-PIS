'use client';

import { useState } from 'react';
import { UserPlus, MoreVertical, Shield, Mail, User as UserIcon } from 'lucide-react';
import clsx from 'clsx';

import { CreateUserForm } from './CreateUserForm';
import { AnimatePresence, motion } from 'framer-motion';

const initialUsers = [
    { id: 1, name: 'Admin User', email: 'admin@pis-system.com', role: 'Super Admin', status: 'Active' },
    { id: 2, name: 'Sarah Chen', email: 'sarah@pis-system.com', role: 'Procurement Manager', status: 'Active' },
    { id: 3, name: 'John Doe', email: 'john@pis-system.com', role: 'Kitchen Lead', status: 'Inactive' },
];

export function UserManagement() {
    const [users, setUsers] = useState(initialUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddUser = (user: any) => {
        setUsers([user, ...users]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">System Users</h3>
                    <p className="text-gray-500 text-sm">Manage access and identify platform users.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all"
                >
                    <UserPlus className="w-4 h-4" />
                    Create User
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">User</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Role</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                                        <Shield className="w-3.5 h-3.5 text-orange-400" />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
                                        user.status === 'Active' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                    )}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
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
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                        >
                            <CreateUserForm
                                onClose={() => setIsModalOpen(false)}
                                onSuccess={handleAddUser}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
