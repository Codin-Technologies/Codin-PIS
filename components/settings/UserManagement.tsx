'use client';

import { useState, useRef, useEffect } from 'react';
import { UserPlus, MoreVertical, Shield, User as UserIcon, Eye, Pencil, Trash2, AlertTriangle, X, Mail, Building2, Calendar, Phone, Activity } from 'lucide-react';
import clsx from 'clsx';

import { CreateUserForm } from './CreateUserForm';
import { AnimatePresence, motion } from 'framer-motion';
import { useUsers, useUser, useDeleteUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/lib/api';

export function UserManagement() {
    const { data: usersData, isLoading } = useUsers();
    const deleteUserMutation = useDeleteUser();
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserType | null>(null);
    const [viewingUserId, setViewingUserId] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const { data: viewingUser, isLoading: isLoadingView } = useUser(viewingUserId);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const users = usersData ?? [];

    const handleActionSuccess = () => {
        setIsCreateModalOpen(false);
        setEditingUser(null);
        setDeletingUser(null);
    };

    const handleDelete = async () => {
        if (!deletingUser) return;
        deleteUserMutation.mutate(deletingUser.id, {
            onSuccess: () => {
                setDeletingUser(null);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">System Users</h3>
                    <p className="text-gray-500 text-sm">Manage access and identify platform users.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all font-sans"
                >
                    <UserPlus className="w-4 h-4" />
                    Create User account
                </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">User</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Role</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 border-l border-gray-50/10">Org / Branch</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading && Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 rounded bg-gray-100" />
                                            <div className="h-3 w-24 rounded bg-gray-50" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-gray-100" /></td>
                                <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-gray-100" /></td>
                                <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-gray-100" /></td>
                                <td className="px-6 py-4 text-right"><div className="h-8 w-8 ml-auto rounded bg-gray-50" /></td>
                            </tr>
                        ))}
                        {!isLoading && users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 font-bold group-hover:bg-pink-100 transition-colors">
                                            {user.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{user.fullName}</div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                                        <Shield className="w-3.5 h-3.5 text-orange-400" />
                                        {user.roleName || 'System User'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                        {user.branchName || 'Global'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                        user.status === 'Inactive' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                                    )}>
                                        {user.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative inline-block text-left">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === user.id ? null : user.id);
                                            }}
                                            className={clsx(
                                                "p-2 rounded-lg transition-colors",
                                                activeMenu === user.id ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                                            )}
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        <AnimatePresence>
                                            {activeMenu === user.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20"
                                                    ref={menuRef}
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setViewingUserId(user.id);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 text-orange-500" />
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingUser(user);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4 text-blue-500" />
                                                        Edit Account
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeletingUser(user);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete User
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-gray-400 italic">No users found. Start by creating a new account.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit User Modal */}
            <AnimatePresence>
                {(isCreateModalOpen || editingUser) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setEditingUser(null);
                            }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                        >
                            <CreateUserForm
                                onClose={() => {
                                    setIsCreateModalOpen(false);
                                    setEditingUser(null);
                                }}
                                onSuccess={handleActionSuccess}
                                user={editingUser || undefined}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Profile Modal */}
            <AnimatePresence>
                {viewingUserId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingUserId(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute right-8 top-8">
                                <button onClick={() => setViewingUserId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {isLoadingView ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                    <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-medium font-sans">Fetching profile details...</p>
                                </div>
                            ) : viewingUser ? (
                                <div className="space-y-8">
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-pink-200">
                                            {viewingUser.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">{viewingUser.fullName}</h2>
                                            <p className="text-gray-500 font-medium">{viewingUser.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                <Shield className="w-3.5 h-3.5" /> {viewingUser.roleName || 'System User'}
                                            </span>
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                viewingUser.status === 'Inactive' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                                            )}>
                                                {viewingUser.status || 'Active'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Building2 className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Organization</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">{viewingUser.branchName || 'Headquarters'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Joined</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">{new Date(viewingUser.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Primary Contact</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 break-all">{viewingUser.email}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Activity className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Last Active</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">Just now</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <Button
                                            onClick={() => setViewingUserId(null)}
                                            className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                                        >
                                            Dismiss
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setEditingUser(viewingUser);
                                                setViewingUserId(null);
                                            }}
                                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-pink-200"
                                        >
                                            Edit Profile
                                        </Button>
                                    </div>
                                </div>
                            ) : null}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeletingUser(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                    <AlertTriangle className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Delete User account?</h3>
                                    <p className="text-gray-500 mt-2">
                                        Are you sure you want to delete <span className="font-bold text-gray-900">{deletingUser.fullName}</span>? 
                                        This will immediately revoke their access to the system. This action cannot be undone.
                                    </p>
                                </div>
                                <div className="flex w-full gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setDeletingUser(null)}
                                        className="flex-1 h-12 rounded-xl text-gray-500 font-bold hover:bg-gray-100"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        disabled={deleteUserMutation.isPending}
                                        className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200"
                                    >
                                        {deleteUserMutation.isPending ? "Deleting..." : "Yes, Delete"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
