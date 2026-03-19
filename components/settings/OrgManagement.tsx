import { useState, useRef, useEffect } from 'react';
import { Building2, MapPin, Globe, Plus, MoreHorizontal, Pencil, Trash2, AlertTriangle, X, Eye, Phone, Calendar, Users as UsersIcon } from 'lucide-react';
import { CreateOrgForm } from './CreateOrgForm';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrganizations, useDeleteOrganization, useOrganization } from '@/hooks/useUsers';
import { Organization } from '@/lib/api';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

export function OrgManagement() {
    const { data: orgs, isLoading, error } = useOrganizations();
    const deleteOrgMutation = useDeleteOrganization();
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
    const [viewingOrgId, setViewingOrgId] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const { data: viewingOrg, isLoading: isLoadingView } = useOrganization(viewingOrgId);

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

    const handleActionSuccess = () => {
        setIsCreateModalOpen(false);
        setEditingOrg(null);
        setDeletingOrg(null);
    };

    const handleDelete = async () => {
        if (!deletingOrg) return;
        deleteOrgMutation.mutate(deletingOrg.id, {
            onSuccess: () => {
                setDeletingOrg(null);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Security Groups & Organizations</h3>
                    <p className="text-gray-500 text-sm">Organize your business into branches and security domains.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all font-sans"
                >
                    <Plus className="w-4 h-4" />
                    New Organization
                </button>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl gap-4">
                        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Loading organizations...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center bg-red-50 border border-red-100 rounded-3xl text-red-600">
                        <p className="font-bold">Error loading organizations</p>
                        <p className="text-sm">Please refresh the page to try again.</p>
                    </div>
                ) : orgs?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl gap-4 text-center px-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-900 font-bold text-lg">No organizations found</p>
                            <p className="text-gray-500 text-sm max-w-xs">Register your first branch or security group to get started.</p>
                        </div>
                    </div>
                ) : (
                    orgs?.map((org) => (
                        <div key={org.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-orange-500/50 shadow-sm relative">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900 text-lg">{org.name}</h4>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                            {org.organizationType?.name || 'Branch'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" /> {org.location || 'No location set'}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Globe className="w-3 h-3" /> Global Security Group
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-gray-900">{org.users?.length || 0}</div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Staff</div>
                                </div>
                                <div className="relative">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenu(activeMenu === org.id ? null : org.id);
                                        }}
                                        className={clsx(
                                            "p-2 rounded-lg transition-colors",
                                            activeMenu === org.id ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900"
                                        )}
                                    >
                                        <MoreHorizontal className="w-6 h-6" />
                                    </button>
                                    
                                    <AnimatePresence>
                                        {activeMenu === org.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20"
                                                ref={menuRef}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setViewingOrgId(org.id);
                                                        setActiveMenu(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4 text-orange-500" />
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingOrg(org);
                                                        setActiveMenu(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                    Edit Organization
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeletingOrg(org);
                                                        setActiveMenu(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Organization
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {(isCreateModalOpen || editingOrg) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setEditingOrg(null);
                            }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                        >
                            <CreateOrgForm
                                onClose={() => {
                                    setIsCreateModalOpen(false);
                                    setEditingOrg(null);
                                }}
                                onSuccess={handleActionSuccess}
                                organization={editingOrg || undefined}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {viewingOrgId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingOrgId(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute right-8 top-8">
                                <button onClick={() => setViewingOrgId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {isLoadingView ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-medium">Fetching details...</p>
                                </div>
                            ) : viewingOrg ? (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5 border-b border-gray-100 pb-8">
                                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                                            <Building2 className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900">{viewingOrg.name}</h2>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    {viewingOrg.organizationType?.name}
                                                </span>
                                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" /> Joined {new Date(viewingOrg.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact & Location</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-medium">{viewingOrg.location || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                            <Phone className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-medium">{viewingOrg.contact || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Security Domain</h4>
                                                <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 flex items-center gap-3">
                                                    <Globe className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <p className="text-sm font-bold text-blue-900">Standard Security Group</p>
                                                        <p className="text-xs text-blue-700">Inherits global security policies and RBAC rules.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Branch Staff ({viewingOrg.users?.length || 0})</h4>
                                                <UsersIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                                {viewingOrg.users && viewingOrg.users.length > 0 ? (
                                                    viewingOrg.users.map((user: any) => (
                                                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-orange-500">
                                                                    {user.fullName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                                                                    <p className="text-[10px] text-gray-500">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                                                        <p className="text-sm text-gray-400">No staff members found.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <Button onClick={() => setViewingOrgId(null)} className="h-12 px-8 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all">
                                            Close View
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
                {deletingOrg && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeletingOrg(null)}
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
                                    <h3 className="text-xl font-bold text-gray-900">Delete Organization?</h3>
                                    <p className="text-gray-500 mt-2">
                                        Are you sure you want to delete <span className="font-bold text-gray-900">{deletingOrg.name}</span>? 
                                        This action cannot be undone and may affect associated users.
                                    </p>
                                </div>
                                <div className="flex w-full gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setDeletingOrg(null)}
                                        className="flex-1 h-12 rounded-xl text-gray-500 font-bold hover:bg-gray-100"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        disabled={deleteOrgMutation.isPending}
                                        className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200"
                                    >
                                        {deleteOrgMutation.isPending ? "Deleting..." : "Yes, Delete"}
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
