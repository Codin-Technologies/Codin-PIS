'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, AlertTriangle, CheckCircle, Package, ClipboardList, MoreVertical, Edit2, Trash2, CheckSquare } from 'lucide-react';
import clsx from 'clsx';

import { AddItemModal } from '@/components/inventory/AddItemModal';
import { UpdateItemModal } from '@/components/inventory/UpdateItemModal';
import { DeleteConfirmModal } from '@/components/inventory/DeleteConfirmModal';
import { RecordUsageModal } from '@/components/inventory/RecordUsageModal';

import { 
    useInventory, 
    useInventoryAlerts,
    useCreateInventoryItem, 
    useUpdateInventoryItem,
    useDeleteInventoryItem,
    useAdjustInventoryQuantity,
    useRecordInventoryUsage
} from '@/hooks/useInventory';
import { useDepartments, useCreateDepartment } from '@/hooks/useDepartments';
import { useBranch } from '@/hooks/useBranch';
import { ErrorState } from '@/components/ui/error-state';
import type { CreateInventoryItemPayload, InventoryItem, InventoryAlert } from '@/lib/api';

function InventorySkeletonCard() {
    return (
        <div className="flex items-center space-x-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-gray-200" />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-5 w-16 rounded-full bg-gray-200" />
                </div>
                <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
        </div>
    );
}

function InventoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { branchId } = useBranch();

    const [selectedDept, setSelectedDept]     = useState('All');
    const [searchTerm, setSearchTerm]         = useState('');
    
    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddingDept, setIsAddingDept]     = useState(false);
    const [newDeptName, setNewDeptName]       = useState('');
    const [updateItem, setUpdateItem]         = useState<InventoryItem | null>(null);
    const [deleteItem, setDeleteItem]         = useState<InventoryItem | null>(null);
    const [usageItem, setUsageItem]           = useState<InventoryItem | null>(null);
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    const [openDropdown, setOpenDropdown]     = useState<string | null>(null);

    useEffect(() => {
        if (searchParams.get('action') === 'new-item') setIsAddModalOpen(true);
    }, [searchParams]);

    // Data Fetching
    const { data, isLoading, isError, error } = useInventory(branchId, {
        dept: selectedDept === 'All' ? undefined : selectedDept,
        search: searchTerm || undefined,
    });
    const { data: alertsData, isLoading: alertsLoading } = useInventoryAlerts(branchId);
    const { data: deptData, isLoading: deptLoading } = useDepartments(branchId);

    // Mutations
    const createItemMutation = useCreateInventoryItem(branchId);
    const updateItemMutation = useUpdateInventoryItem(branchId);
    const deleteItemMutation = useDeleteInventoryItem(branchId);
    const adjustQtyMutation = useAdjustInventoryQuantity(branchId);
    const recordUsageMutation = useRecordInventoryUsage(branchId);
    const createDeptMutation = useCreateDepartment(branchId);

    const items: InventoryItem[]  = data?.data ?? [];
    const alerts: InventoryAlert[] = (alertsData as InventoryAlert[]) ?? [];
    const departments = deptData ?? [];
    const totalValuation = items.reduce((sum, i) => sum + (i.qty * (i.unitCost ?? 0)), 0);

    // Handlers
    function handleAddItem(payload: CreateInventoryItemPayload) {
        createItemMutation.mutate(
            { ...payload, branchId }, 
            { onSuccess: () => setIsAddModalOpen(false) }
        );
    }

    function handleUpdateItem(id: string, payload: any) {
        updateItemMutation.mutate({ id, payload }, {
            onSuccess: () => setUpdateItem(null)
        });
    }

    function handleDeleteItem(id: string) {
        deleteItemMutation.mutate(id, {
            onSuccess: () => setDeleteItem(null)
        });
    }

    function handleAdjustQty(id: string, payload: { qtyDelta: number; reason: string }) {
        adjustQtyMutation.mutate({ id, payload }, {
            onSuccess: () => setUsageItem(null)
        });
    }

    function handleRecordUsage(payload: {
        date: string;
        reason: string;
        notes: string;
        organizationId: string;
        recordedById: string;
        items: { inventoryItemId: string; qtyUsed: number }[];
    }) {
        recordUsageMutation.mutate(payload, {
            onSuccess: () => setIsUsageModalOpen(false)
        });
    }

    function handleAddDept() {
        if (!newDeptName) return;
        createDeptMutation.mutate(newDeptName, {
            onSuccess: () => {
                setIsAddingDept(false);
                setNewDeptName('');
            }
        });
    }

    // Close dropdown on outside click (simple hookless behavior via window click)
    useEffect(() => {
        const handleClick = () => setOpenDropdown(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddItem as any}
                departments={departments}
                isPending={createItemMutation.isPending}
                error={createItemMutation.error}
            />
            
            <UpdateItemModal
                isOpen={!!updateItem}
                onClose={() => setUpdateItem(null)}
                onUpdate={handleUpdateItem}
                departments={departments}
                item={updateItem}
                isPending={updateItemMutation.isPending}
                error={updateItemMutation.error}
            />

            <DeleteConfirmModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDeleteItem}
                item={deleteItem}
                isPending={deleteItemMutation.isPending}
                error={deleteItemMutation.error}
            />

            <RecordUsageModal
                isOpen={isUsageModalOpen}
                onClose={() => { setIsUsageModalOpen(false); setUsageItem(null); }}
                onRecord={handleRecordUsage}
                defaultItemId={usageItem?.id}
                isPending={recordUsageMutation.isPending}
                error={recordUsageMutation.error}
            />

            {/* Left Section: Inventory Grid */}
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">

                {/* Header & Controls */}
                <div className="flex flex-col space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">Inventory Items</h1>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/inventory/usage')}
                                className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
                            >
                                <ClipboardList className="h-4 w-4" />
                                <span>Usage Logs</span>
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center space-x-2 rounded-xl bg-[#2a2b2d] px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 shadow-lg"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Item</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 text-sm">
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-full bg-gray-50 border-none py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-[#2a2b2d] sm:leading-6"
                                placeholder="Search by Name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 items-center">
                            <button
                                onClick={() => setSelectedDept('All')}
                                className={clsx(
                                    "rounded-full px-4 py-1.5 font-medium whitespace-nowrap transition-colors",
                                    selectedDept === 'All' ? 'bg-[#2a2b2d] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                )}
                            >
                                All
                            </button>
                            {!deptLoading && departments.map((dept) => (
                                <button
                                    key={dept.id}
                                    onClick={() => setSelectedDept(dept.name)}
                                    className={clsx(
                                        "rounded-full px-4 py-1.5 font-medium whitespace-nowrap transition-colors",
                                        selectedDept === dept.name ? 'bg-[#2a2b2d] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    )}
                                >
                                    {dept.name}
                                </button>
                            ))}
                            {isAddingDept ? (
                                <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 ring-1 ring-gray-200">
                                    <input
                                        autoFocus
                                        className="bg-transparent border-none text-xs w-24 focus:ring-0"
                                        placeholder="Name..."
                                        value={newDeptName}
                                        onChange={e => setNewDeptName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddDept()}
                                        onBlur={() => { if (!newDeptName) setIsAddingDept(false); }}
                                    />
                                    <button onClick={handleAddDept} className="p-1 hover:text-green-600" disabled={createDeptMutation.isPending}>
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingDept(true)}
                                    className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                    title="Add Department"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {isError && (
                    <div className="py-12">
                        <ErrorState 
                            title="Inventory Access Error"
                            error={error as Error}
                            onRetry={() => window.location.reload()}
                        />
                    </div>
                )}

                {/* Item Grid */}
                {!isError && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                        {isLoading && Array.from({ length: 6 }).map((_, i) => <InventorySkeletonCard key={i} />)}

                        {!isLoading && items.map((item) => (
                            <div key={item.id} className="group relative flex items-center space-x-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl">
                                    {item.image ?? '📦'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="truncate text-base font-bold text-gray-900">{item.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                                item.status === 'Good'     ? 'bg-green-50 text-green-700'  :
                                                item.status === 'Low'      ? 'bg-yellow-50 text-yellow-700':
                                                item.status === 'Critical' ? 'bg-red-50 text-red-700'      :
                                                                             'bg-gray-50 text-gray-700'
                                            )}>
                                                {item.status}
                                            </span>
                                            
                                            {/* Action Dropdown Toggle */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdown(openDropdown === item.id ? null : item.id);
                                                }}
                                                className="p-1 rounded bg-gray-50 hover:bg-gray-200 text-gray-500"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">{item.sku} • {item.dept}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm font-bold text-gray-900">
                                            {item.qty} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Dropdown Menu */}
                                {openDropdown === item.id && (
                                    <div className="absolute top-12 right-4 z-10 w-40 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                                        <div className="py-1">
                                            <button 
                                                onClick={() => { setUsageItem(item); setIsUsageModalOpen(true); setOpenDropdown(null); }}
                                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <ClipboardList className="mr-3 h-4 w-4 text-gray-400" />
                                                Record Usage
                                            </button>
                                            <button 
                                                onClick={() => { setUpdateItem(item); setOpenDropdown(null); }}
                                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Edit2 className="mr-3 h-4 w-4 text-gray-400" />
                                                Manage Details
                                            </button>
                                            <button 
                                                onClick={() => { setDeleteItem(item); setOpenDropdown(null); }}
                                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="mr-3 h-4 w-4 text-red-500" />
                                                Delete Item
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {!isLoading && items.length === 0 && (
                            <div className="col-span-full py-10 text-center text-gray-500">
                                No items found matching your criteria.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Section: Alerts & Summary */}
            <div className="w-80 hidden lg:flex flex-col gap-6 h-full">

                {/* Alerts Panel */}
                <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Alerts</h2>
                            <p className="text-xs text-gray-500">Items requiring attention</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                        {alertsLoading && Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                        {!alertsLoading && alerts.map((alert) => (
                            <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
                                <div className="flex items-center space-x-3">
                                    <div className="text-xl">{alert.image ?? '📦'}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{alert.name}</p>
                                        <p className="text-xs text-red-600 font-medium">{alert.message || `Only ${alert.qty} ${alert.unit} left`}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!alertsLoading && alerts.length === 0 && (
                            <div className="text-center py-6">
                                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">All stock levels good!</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-center flex flex-col gap-2">
                        <button onClick={() => router.push('/procurement')} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            View Procurement
                        </button>
                    </div>
                </div>

                {/* Valuation Summary */}
                <div className="rounded-2xl bg-[#2a2b2d] p-6 shadow-lg text-white">
                    <h3 className="font-bold text-lg mb-1">Total Valuation</h3>
                    <p className="text-3xl font-bold mb-4">
                        {isLoading ? '—' : `$${totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-300 bg-white/10 p-2 rounded-lg">
                        <Package className="h-4 w-4" />
                        <span>{isLoading ? '—' : `${data?.total ?? 0} Total Items`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InventoryPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading inventory...</div>}>
            <InventoryContent />
        </Suspense>
    );
}
