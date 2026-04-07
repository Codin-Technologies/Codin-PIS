'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    LayoutDashboard, FileText, Users, ShoppingCart, Truck,
    Receipt, FileCheck, ShieldAlert, BadgeDollarSign,
    PieChart, ArrowUpRight, ArrowDownRight, MoreHorizontal,
    Search, Filter, Plus
} from 'lucide-react';
import clsx from 'clsx';
import { NewRequisitionModal } from '@/components/procurement/NewRequisitionModal';
import { RequisitionList } from '@/components/procurement/RequisitionList';
import { RFQView } from '@/components/procurement/RFQView';
import { PurchaseOrderView } from '@/components/procurement/PurchaseOrderView';
import { SuppliersView } from '@/components/procurement/SuppliersView';
import { BudgetView } from '@/components/procurement/BudgetView';
import { InvoiceView } from '@/components/procurement/InvoiceView';
import { useBranch } from '@/hooks/useBranch';
import { useCurrency } from '@/hooks/useCurrency';
import { useRequisitions } from '@/hooks/useRequisitions';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useRFQs } from '@/hooks/useRFQs';
import { useInventoryAlerts } from '@/hooks/useInventory';

// --- Types ---

type Tab = 'overview' | 'requisitions' | 'rfq' | 'orders' | 'receiving' | 'invoices' | 'suppliers' | 'contracts' | 'budget' | 'compliance';

function ProcurementContent() {
    const { branchId } = useBranch();
    const { format: f } = useCurrency();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isReqModalOpen, setIsReqModalOpen] = useState(false);

    const searchParams = useSearchParams();

    // Data Hooks
    const { data: requisitionData, isLoading: isLoadingReqs } = useRequisitions(branchId, { pageSize: 5 });
    const { data: poData, isLoading: isLoadingPOs } = usePurchaseOrders(branchId);
    const { data: rfqData } = useRFQs(branchId);
    const { data: supplierData } = useSuppliers(branchId);
    const { data: inventoryAlerts } = useInventoryAlerts(branchId);

    const requisitions = requisitionData?.data ?? [];
    const pos = poData?.data ?? [];
    const rfqs = rfqData?.data ?? [];
    const suppliers = supplierData?.data ?? [];
    const alerts = inventoryAlerts ?? [];

    // --- Calculations ---

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const spendToday = pos.reduce((acc, po) => {
        const poDate = new Date(po.createdAt);
        if (poDate >= today) return acc + Number(po.totalValue || 0);
        return acc;
    }, 0);

    const openPOs = pos.filter(po => po.status !== 'Received' && po.status !== 'Cancelled');
    const pendingReqs = requisitions.filter(req => req.status === 'pending');
    
    const avgSupplierScore = suppliers.length > 0 
        ? Math.round(suppliers.reduce((acc, s) => acc + (s.reliability || 0), 0) / suppliers.length) 
        : 0;

    const stats = [
        { label: 'Spend (Today)', value: f(spendToday), change: `${pos.filter(po => new Date(po.createdAt) >= today).length} POs`, type: 'neutral' as const },
        { label: 'Open POs', value: openPOs.length.toString(), change: `${pos.filter(p => (p.status === 'Sent' || p.status === 'Confirmed') && p.deliveryDate && new Date(p.deliveryDate) < today).length} Overdue`, type: 'neutral' as const },
        { label: 'Requirements', value: pendingReqs.length.toString(), change: 'Awaiting Review', type: 'down' as const },
        { label: 'Partner Score', value: `${avgSupplierScore}%`, change: 'Avg Reliability', type: 'up' as const },
    ];

    // --- Dynamic Risks ---
    const dynamicRisks = [
        ...alerts.slice(0, 2).map(alert => ({
            id: `alert-${alert.id}`,
            type: 'Inventory Alert',
            message: `${alert.name} is below threshold (${alert.qty} remaining)`,
            severity: 'critical' as const
        })),
        ...rfqs.filter(r => {
            if (!r.deadline) return false;
            const diff = new Date(r.deadline).getTime() - Date.now();
            return diff > 0 && diff < 48 * 60 * 60 * 1000;
        }).map(rfq => ({
            id: `rfq-${rfq.id}`,
            type: 'Deadline Risk',
            message: `RFQ ${rfq.rfqNumber} expires within 48h`,
            severity: 'warning' as const
        })),
        ...pos.filter(p => (p.status === 'Sent' || p.status === 'Confirmed') && p.deliveryDate && new Date(p.deliveryDate) < today).map(po => ({
            id: `po-${po.id}`,
            type: 'Late Delivery',
            message: `PO ${po.id} from ${po.supplier} is delayed`,
            severity: 'warning' as const
        }))
    ].slice(0, 3);

    const TABS: { id: Tab; label: string; icon: any }[] = [
        { id: 'overview', label: 'Control Tower', icon: LayoutDashboard },
        { id: 'requisitions', label: 'Requisitions', icon: FileText },
        { id: 'rfq', label: 'Sourcing (RFQ)', icon: Users },
        { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart },
        { id: 'receiving', label: 'Goods Received', icon: Truck },
        { id: 'invoices', label: 'Invoices', icon: Receipt },
        { id: 'suppliers', label: 'Suppliers', icon: Users },
        { id: 'contracts', label: 'Contracts', icon: FileCheck },
        { id: 'budget', label: 'Budgets', icon: BadgeDollarSign },
        { id: 'compliance', label: 'Compliance', icon: ShieldAlert },
    ];

    useEffect(() => {
        const action = searchParams.get('action');
        const tabParam = searchParams.get('tab');

        if (tabParam && TABS.some(t => t.id === tabParam)) {
            setActiveTab(tabParam as Tab);
        }

        if (action === 'new-req') {
            setIsReqModalOpen(true);
        }
        // For new-po, we expect the tab to be switched to 'orders' via the URL param,
        // and then we can pass a prop or use state to trigger the create view within PurchaseOrderView.
        // However, PurchaseOrderView manages its own state. 
        // We might need to lift state or pass a default view prop to PurchaseOrderView.
    }, [searchParams]);

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            <NewRequisitionModal isOpen={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} />

            {/* Left Sidebar: Navigation Tabs */}
            <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                <div className="rounded-2xl bg-white p-4 shadow-sm mb-2">
                    <h2 className="text-lg font-bold text-gray-900 px-2">Procurement</h2>
                    <p className="text-xs text-gray-500 px-2">Supply Chain OS</p>
                </div>

                <nav className="flex flex-col gap-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group",
                                activeTab === tab.id
                                    ? "bg-[#2a2b2d] text-white shadow-md"
                                    : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
                            )}
                        >
                            <tab.icon className={clsx("h-5 w-5", activeTab === tab.id ? "text-pink-400" : "text-gray-400 group-hover:text-gray-600")} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">

                {activeTab === 'overview' && (
                    <>
                        {/* Header Actions */}
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Control Tower</h1>
                            <div className="flex space-x-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" placeholder="Search POs, SKU, Supplier..." className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]" />
                                </div>
                                <button
                                    onClick={() => setIsReqModalOpen(true)}
                                    className="flex items-center space-x-2 rounded-xl bg-[#2a2b2d] px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 shadow-lg"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>New Requisition</span>
                                </button>
                            </div>
                        </div>

                        {/* KPIS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <div className="mt-2 flex items-baseline space-x-2">
                                        <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                                        <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full",
                                            stat.type === 'up' ? 'bg-green-50 text-green-700' :
                                                stat.type === 'down' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600')}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Grid: Pipeline & Risks */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Requisition Pipeline */}
                            <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Requisition Pipeline</h3>
                                    <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {isLoadingReqs ? (
                                        <div className="py-8 text-center text-gray-400 text-sm">Syncing pipeline...</div>
                                    ) : requisitions.length === 0 ? (
                                        <div className="py-8 text-center text-gray-400 text-sm">No recent requisitions</div>
                                    ) : requisitions.slice(0, 3).map((req, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{req.priority === 'High' ? '🔥' : '📄'}</div>
                                                <div>
                                                    <p className="font-bold text-gray-900 line-clamp-1">{req.reason || 'Sourcing Event'}</p>
                                                    <p className="text-xs text-gray-500">{req.requisitionNumber} • {req.dept}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{f(Number(req.estimatedTotal || 0))}</p>
                                                <span className={clsx("text-xs font-semibold capitalize",
                                                    req.status === 'approved' ? 'text-green-600' : 'text-orange-500')}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Risk Alerts */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Risk Alerts</h3>
                                    <ShieldAlert className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="space-y-3">
                                    {dynamicRisks.length === 0 ? (
                                        <div className="py-8 text-center text-gray-400 text-sm">No immediate risks detected</div>
                                    ) : dynamicRisks.map((risk) => (
                                        <div key={risk.id} className={clsx("p-4 rounded-xl border-l-4",
                                            risk.severity === 'critical' ? "bg-red-50 border-red-500" :
                                                risk.severity === 'warning' ? "bg-orange-50 border-orange-500" : "bg-blue-50 border-blue-500"
                                        )}>
                                            <div className="flex justify-between items-start">
                                                <h4 className={clsx("text-sm font-bold",
                                                    risk.severity === 'critical' ? "text-red-800" : "text-gray-900"
                                                )}>{risk.type}</h4>
                                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{risk.severity}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{risk.message}</p>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                                    System Health Report
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'requisitions' && (
                    <RequisitionList />
                )}

                {activeTab === 'rfq' && (
                    <RFQView />
                )}

                {activeTab === 'orders' && (
                    <PurchaseOrderView initialView={searchParams.get('action') === 'new-po' ? 'CREATE' : 'DASHBOARD'} />
                )}

                {activeTab === 'receiving' && (
                    <GoodsReceivedView />
                )}

                {activeTab === 'invoices' && (
                    <InvoiceView />
                )}

                {activeTab === 'suppliers' && (
                    <SuppliersView />
                )}

                {activeTab === 'budget' && (
                    <BudgetView />
                )}

                {activeTab !== 'overview' &&
                    activeTab !== 'requisitions' &&
                    activeTab !== 'rfq' &&
                    activeTab !== 'orders' &&
                    activeTab !== 'receiving' &&
                    activeTab !== 'invoices' &&
                    activeTab !== 'suppliers' &&
                    activeTab !== 'budget' && (
                        <div className="flex flex-col items-center justify-center h-96 rounded-2xl bg-white border border-gray-100 p-12 text-center">
                            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                                {(() => {
                                    const Icon = TABS.find(t => t.id === activeTab)?.icon;
                                    return Icon ? <Icon className="h-10 w-10 text-gray-400" /> : null;
                                })()}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{TABS.find(t => t.id === activeTab)?.label} Module</h2>
                            <p className="text-gray-500 max-w-md">
                                This module is currently under active development.
                                Features for {TABS.find(t => t.id === activeTab)?.label.toLowerCase()} will be enabled in the next release.
                            </p>
                            <button onClick={() => setActiveTab('overview')} className="mt-8 text-sm font-medium text-blue-600 hover:text-blue-800">
                                Return to Control Tower
                            </button>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default function ProcurementPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading procurement...</div>}>
            <ProcurementContent />
        </Suspense>
    );
}
