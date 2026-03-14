'use client';

import { useState } from 'react';
import {
    Search, Plus, ClipboardList, UtensilsCrossed,
    Zap, AlertCircle, ChefHat, Timer,
    Activity, History, Filter, MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import { CookingPlanCard } from '@/components/kitchen/CookingPlanCard';
import { SpecialOrderForm } from '@/components/kitchen/SpecialOrderForm';
import { NewProductionModal } from '@/components/kitchen/NewProductionModal';

// --- Mock Data ---

const INITIAL_PLANNED_COOKINGS = [
    {
        id: 'PC-001',
        dish: 'Braised Beef Short Ribs',
        servings: 40,
        status: 'In Prep' as const,
        startTime: '10:00 AM',
        ingredients: [
            { id: 'i1', name: 'Beef Short Ribs', qty: 15, unit: 'kg', inventoryId: 'MEA-002' },
            { id: 'i2', name: 'Red Wine', qty: 4, unit: 'btl', inventoryId: 'BEV-005' },
            { id: 'i3', name: 'Carrots', qty: 5, unit: 'kg', inventoryId: 'VEG-003' }
        ]
    },
    {
        id: 'PC-002',
        dish: 'Creamy Mushroom Risotto',
        servings: 25,
        status: 'Planned' as const,
        startTime: '11:30 AM',
        ingredients: [
            { id: 'i4', name: 'Arborio Rice', qty: 5, unit: 'kg', inventoryId: 'GRN-003' },
            { id: 'i5', name: 'Mixed Mushrooms', qty: 3, unit: 'kg', inventoryId: 'VEG-008' },
            { id: 'i6', name: 'Parmesan', qty: 1, unit: 'kg', inventoryId: 'DAI-001' }
        ]
    },
    {
        id: 'PC-003',
        dish: 'Pan-Seared Sea Bass',
        servings: 15,
        status: 'Completed' as const,
        startTime: '09:00 AM',
        ingredients: [
            { id: 'i7', name: 'Sea Bass Fillets', qty: 15, unit: 'pcs', inventoryId: 'SEA-001' },
            { id: 'i8', name: 'Lemon', qty: 10, unit: 'pcs', inventoryId: 'VEG-012' }
        ]
    }
];

const INITIAL_SPECIAL_ORDERS = [
    { id: 1, request: 'Gluten-Free Pasta - Table 4', notes: 'Severe celiac, separate pot.', time: '12:05 PM', status: 'Pending', priority: 'Critical' },
    { id: 2, request: 'No Onions Burger - Table 12', notes: 'Preference.', time: '12:15 PM', status: 'Cooked', priority: 'Normal' },
];

export default function KitchenPage() {
    const [activeTab, setActiveTab] = useState<'PRODUCTION' | 'SPECIAL'>('PRODUCTION');
    const [plannedCookings, setPlannedCookings] = useState(INITIAL_PLANNED_COOKINGS);
    const [specialOrders, setSpecialOrders] = useState(INITIAL_SPECIAL_ORDERS);
    const [isSpecialOrderModalOpen, setIsSpecialOrderModalOpen] = useState(false);
    const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);

    const handleDeduct = (id: string) => {
        alert(`Inventory Deducted for ${id}`);
        setPlannedCookings(prev => prev.map(pc =>
            pc.id === id ? { ...pc, status: 'Completed' as const } : pc
        ));
    };

    const handleStatusUpdate = (id: string, newStatus: any) => {
        setPlannedCookings(prev => prev.map(pc =>
            pc.id === id ? { ...pc, status: newStatus } : pc
        ));
    };

    const handleAddSpecialOrder = (newOrder: any) => {
        setSpecialOrders([newOrder, ...specialOrders]);
    };

    const handleAddProduction = (newPlan: any) => {
        setPlannedCookings([newPlan, ...plannedCookings]);
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            <SpecialOrderForm
                isOpen={isSpecialOrderModalOpen}
                onClose={() => setIsSpecialOrderModalOpen(false)}
                onSubmit={handleAddSpecialOrder}
            />

            <NewProductionModal
                isOpen={isProductionModalOpen}
                onClose={() => setIsProductionModalOpen(false)}
                onAdd={handleAddProduction}
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
                            <h1 className="text-2xl font-bold">Chef's Production Floor</h1>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <Activity className="h-4 w-4 text-green-500" />
                                3 Active Cookings • Lunch Shift
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setActiveTab('PRODUCTION')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                    activeTab === 'PRODUCTION' ? "bg-white text-gray-900 shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Planned Production
                            </button>
                            <button
                                onClick={() => setActiveTab('SPECIAL')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                    activeTab === 'SPECIAL' ? "bg-white text-gray-900 shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Special Orders
                                {specialOrders.filter(o => o.status === 'Pending').length > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">
                                        {specialOrders.filter(o => o.status === 'Pending').length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main View Area */}
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin pb-6">
                    {activeTab === 'PRODUCTION' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {plannedCookings.map((cooking) => (
                                <CookingPlanCard
                                    key={cooking.id}
                                    {...cooking}
                                    onStatusChange={(status) => handleStatusUpdate(cooking.id, status)}
                                    onIngredientsDeduct={() => handleDeduct(cooking.id)}
                                />
                            ))}
                            <button
                                onClick={() => setIsProductionModalOpen(true)}
                                className="h-full min-h-[160px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all hover:bg-gray-50 bg-white/50"
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
                                >
                                    <Plus className="h-4 w-4" />
                                    New Special Order
                                </button>
                            </div>
                            {specialOrders.map((order) => (
                                <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={clsx("h-12 w-12 rounded-xl flex items-center justify-center shadow-inner",
                                            order.priority === 'Critical' ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"
                                        )}>
                                            <Zap className={clsx("h-6 w-6", order.priority === 'Critical' ? "fill-red-500" : "")} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{order.request}</h4>
                                            <p className="text-sm text-gray-500">{order.notes}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{order.time}</p>
                                            <span className={clsx("text-xs font-bold",
                                                order.status === 'Pending' ? "text-orange-500" : "text-green-600"
                                            )}>{order.status}</span>
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
