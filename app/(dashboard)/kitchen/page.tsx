'use client';

import { useState, Suspense } from 'react';
import {
    Plus, ClipboardList,
    Zap, AlertCircle, ChefHat, Timer,
    Activity, History, MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CookingPlanCard } from '@/components/kitchen/CookingPlanCard';
import { SpecialOrderForm } from '@/components/kitchen/SpecialOrderForm';
import { NewProductionModal } from '@/components/kitchen/NewProductionModal';
import { useBranch } from '@/hooks/useBranch';
import { useProductionPlans, useSpecialOrders, useUpdateSpecialOrderStatus } from '@/hooks/useKitchen';
import { ErrorState } from '@/components/ui/error-state';
import { type SpecialOrder, type ProductionPlan } from '@/lib/api';

function KitchenPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { branchId } = useBranch();
    const [isSpecialOrderModalOpen, setIsSpecialOrderModalOpen] = useState(false);
    const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
    const activeTab: 'PRODUCTION' | 'SPECIAL' = searchParams.get('tab') === 'special' ? 'SPECIAL' : 'PRODUCTION';
    const isProductionModalVisible = isProductionModalOpen || searchParams.get('action') === 'new-production';
    const isSpecialOrderModalVisible = isSpecialOrderModalOpen || searchParams.get('action') === 'new-special-order';

    // Data Fetching
    const { 
        data: productionData, 
        isLoading: isProductionLoading, 
        isError: isProductionError, 
        error: productionError 
    } = useProductionPlans(branchId);
    
    const { 
        data: specialOrdersData, 
        isLoading: isSpecialOrdersLoading, 
        isError: isSpecialOrdersError, 
        error: specialOrdersError 
    } = useSpecialOrders(branchId);

    // Mutations
    const updateSpecialOrderStatusMutation = useUpdateSpecialOrderStatus(branchId);

    const plannedCookings = productionData?.data ?? [];
    const specialOrders = specialOrdersData?.data ?? [];

    const handleSpecialOrderStatusUpdate = (id: string, status: SpecialOrder['status']) => {
        updateSpecialOrderStatusMutation.mutate({ id, status });
    };

    const handleTabChange = (tab: 'PRODUCTION' | 'SPECIAL') => {
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set('tab', tab === 'SPECIAL' ? 'special' : 'production');
        nextParams.delete('action');
        const query = nextParams.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    const closeProductionModal = () => {
        setIsProductionModalOpen(false);

        if (searchParams.get('action') !== 'new-production') {
            return;
        }

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete('action');
        const query = nextParams.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    const closeSpecialOrderModal = () => {
        setIsSpecialOrderModalOpen(false);

        if (searchParams.get('action') !== 'new-special-order') {
            return;
        }

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete('action');
        const query = nextParams.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    if (isProductionError || isSpecialOrdersError) {
        return (
            <div className="p-8">
                <ErrorState 
                    title="Kitchen Access Error"
                    error={(productionError || specialOrdersError) as Error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            <SpecialOrderForm
                isOpen={isSpecialOrderModalVisible}
                onClose={closeSpecialOrderModal}
            />

            <NewProductionModal
                isOpen={isProductionModalVisible}
                onClose={closeProductionModal}
            />

            {/* Left: Production Dashboard */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-[#1e1f21] rounded-3xl p-6 text-white shadow-xl flex items-center justify-between shrink-0 border border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <ChefHat className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Chef&apos;s Production Floor</h1>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <Activity className="h-4 w-4 text-green-500" />
                                3 Active Cookings • Lunch Shift
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => handleTabChange('PRODUCTION')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                    activeTab === 'PRODUCTION' ? "bg-white text-gray-900 shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                                data-tour="kitchen-production-tab"
                            >
                                Planned Production
                            </button>
                            <button
                                onClick={() => handleTabChange('SPECIAL')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                    activeTab === 'SPECIAL' ? "bg-white text-gray-900 shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                                data-tour="kitchen-special-tab"
                            >
                                Special Orders
                                {specialOrders.filter((o: SpecialOrder) => o.status === 'Pending').length > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">
                                        {specialOrders.filter((o: SpecialOrder) => o.status === 'Pending').length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin pb-6">
                    {activeTab === 'PRODUCTION' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(isProductionLoading || isSpecialOrdersLoading) && Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-48 rounded-3xl bg-gray-100 animate-pulse" />
                            ))}
                            {!isProductionLoading && plannedCookings.map((cooking: ProductionPlan) => (
                                <CookingPlanCard
                                    key={cooking.id}
                                    {...cooking}
                                />
                            ))}
                            <button
                                onClick={() => setIsProductionModalOpen(true)}
                                className="h-full min-h-[160px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all hover:bg-gray-50 bg-white/50"
                                data-tour="create-production-plan-btn"
                            >
                                <Plus className="h-6 w-6" />
                                <span className="font-bold text-sm">Add to Production Plan</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Specialty Requests Log</h3>
                                <button
                                    onClick={() => setIsSpecialOrderModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800 shadow-lg transition-all"
                                    data-tour="create-special-order-btn"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Special Order
                                </button>
                            </div>
                            {specialOrders.map((order: SpecialOrder) => (
                                <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={clsx("h-12 w-12 rounded-xl flex items-center justify-center shadow-inner",
                                            order.priorityLevel === 'Critical' ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"
                                        )}>
                                            <Zap className={clsx("h-6 w-6", order.priorityLevel === 'Critical' ? "fill-red-500" : "")} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{order.requestName}</h4>
                                            <p className="text-sm text-gray-500">{order.preparationNotes}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{order.logTime}</p>
                                            <select 
                                                value={order.status}
                                                onChange={(e) => handleSpecialOrderStatusUpdate(order.id, e.target.value as SpecialOrder['status'])}
                                                className={clsx("text-xs font-bold bg-transparent border-none focus:ring-0 p-0 cursor-pointer",
                                                    order.status === 'Pending' ? "text-orange-500" : "text-green-600"
                                                )}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Cooked">Cooked</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Chef's Sidebar */}
            <div className="w-80 flex flex-col gap-6 h-full shrink-0">
                {/* Shift Clocking */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Shift Status</h3>
                        <Timer className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                            <span className="text-xs font-bold text-gray-500">Service Duration</span>
                            <span className="text-sm font-bold text-gray-900">03:45:12</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                            <span className="text-xs font-bold text-gray-500">Yield Progress</span>
                            <span className="text-sm font-bold text-gray-900">72% Target</span>
                        </div>
                    </div>
                </div>

                {/* Inventory Shortcuts / Low Stock Alerts */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Critical Ingredients</h3>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                        {[
                            { name: 'Beef Short Ribs', qty: '4kg', status: 'Running Low' },
                            { name: 'Heavy Cream', qty: '5L', status: 'Near Expiry' },
                            { name: 'Arborio Rice', qty: '2kg', status: 'Critically Low' }
                        ].map((item, i) => (
                            <div key={i} className="p-3 rounded-xl bg-red-50/30 border border-red-100">
                                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-red-600 font-medium">{item.status}</span>
                                    <span className="text-xs font-bold text-gray-900">{item.qty}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-6 w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Procurement Request
                    </button>
                </div>

                {/* Kitchen History */}
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                        <History className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Recent Logs</span>
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="border-l-2 border-green-500 pl-4">
                            <p className="text-xs font-bold text-gray-900">PC-003 Completed</p>
                            <p className="text-[10px] text-gray-500">15 Servings Pan-Seared Sea Bass</p>
                        </div>
                        <div className="border-l-2 border-gray-300 pl-4">
                            <p className="text-xs font-bold text-gray-900">Inventory Sync</p>
                            <p className="text-[10px] text-gray-500">Manual stock update for Salmon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function KitchenPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-500">Loading kitchen dashboard...</div>}>
            <KitchenPageContent />
        </Suspense>
    );
}
