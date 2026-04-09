'use client';

import { useState } from 'react';
import { Layers, Plus, Search, Loader2 } from 'lucide-react';
import { useBranch } from '@/hooks/useBranch';
import { useDepartments, useCreateDepartment } from '@/hooks/useDepartments';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { emitOnboardingAction } from '@/onboarding/helpers';

export function DepartmentManagement() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { branchId } = useBranch();
    const { data: departments, isLoading, isError, error } = useDepartments(branchId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const isCreateModalVisible = isCreateModalOpen || searchParams.get('action') === 'create-department';

    const filtered = (departments || []).filter(d => 
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    function handleCreateSuccess() {
        closeCreateModal();
    }

    function closeCreateModal() {
        setIsCreateModalOpen(false);

        if (searchParams.get('action') !== 'create-department') {
            return;
        }

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete('action');
        const query = nextParams.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Departments</h3>
                    <p className="text-gray-500 text-sm">Manage business units and cost centers within your branch.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all font-sans"
                    data-tour="add-department-btn"
                >
                    <Plus className="w-4 h-4" />
                    New Department
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search departments..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/10 bg-white"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-3xl gap-3">
                        <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm font-medium">Loading units...</p>
                    </div>
                ) : isError ? (
                    <div className="col-span-full py-20 text-center bg-red-50 border border-red-100 rounded-3xl text-red-600">
                        <p className="font-bold">Failed to load departments</p>
                        <p className="text-sm">{(error as Error).message}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-3xl gap-4 text-center px-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-900 font-bold text-lg">No departments found</p>
                            <p className="text-gray-500 text-sm">Organize your procurement by adding your first unit.</p>
                        </div>
                    </div>
                ) : (
                    filtered.map((dept) => (
                        <motion.div
                            key={dept.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-pink-200 transition-colors shadow-sm group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{dept.name}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Business Unit</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalVisible && (
                    <CreateDepartmentModal 
                        onClose={closeCreateModal}
                        onSuccess={handleCreateSuccess}
                        branchId={branchId}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function CreateDepartmentModal({ onClose, onSuccess, branchId }: { onClose: () => void; onSuccess: () => void; branchId: string }) {
    const createMutation = useCreateDepartment(branchId);
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return setError('Name is required');
        
        try {
            await createMutation.mutateAsync(name);
            emitOnboardingAction('add-department');
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden"
            >
                <div className="mb-8">
                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mb-4">
                        <Layers className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">New Department</h2>
                    <p className="text-gray-500 text-sm mt-1">Create a new business unit for budget tracking.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Department Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Sales, Kitchen, Admin"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            className={clsx(
                                "w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 transition-all",
                                error ? "ring-red-500/20 border-red-500" : "focus:ring-pink-500/20 focus:border-pink-500"
                            )}
                        />
                        {error && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wider">{error}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl text-gray-500 font-bold hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 shadow-lg"
                            data-tour="create-department-submit-btn"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                "Create Department"
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
