'use client';

import { useState } from 'react';
import {
    Truck, CheckCircle, AlertTriangle,
    Package, Calendar, Search, Filter,
    Plus, MoreHorizontal, Eye, ArrowRight,
    ShieldCheck, ClipboardCheck, History,
    Warehouse, Beaker, Scale
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const MOCK_GRNS = [
    {
        id: 'GRN-2026-0012',
        poNumber: 'PO-2026-8799',
        supplier: 'CleanChem Inc',
        receivedDate: '2026-01-12',
        status: 'Fully Received',
        inspection: 'Passed',
        items: 12,
        receivedBy: 'C. Miller'
    },
    {
        id: 'GRN-2026-0013',
        poNumber: 'PO-2026-8801',
        supplier: 'Premium Foods Ltd',
        receivedDate: '2026-01-22',
        status: 'Partial',
        inspection: 'In Progress',
        items: 45,
        receivedBy: 'S. Richards'
    },
    {
        id: 'GRN-2026-0014',
        poNumber: 'PO-2026-8802',
        supplier: 'Global Provisions',
        receivedDate: '2026-01-25',
        status: 'Quarantined',
        inspection: 'Failed',
        items: 8,
        receivedBy: 'S. Richards'
    }
];

const GRN_STATS = [
    { label: 'Today\'s Deliveries', value: '4', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Inspection', value: '2', icon: Beaker, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Quality Pass Rate', value: '96.8%', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Discrepancy Rate', value: '2.1%', icon: Scale, color: 'text-red-600', bg: 'bg-red-50' },
];

export function GoodsReceivedView() {
    const [view, setView] = useState<'DASHBOARD' | 'RECEIVE' | 'DETAIL'>('DASHBOARD');

    const GRNDashboard = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
                {GRN_STATS.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={clsx("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Goods Inward Log</h3>
                    <div className="flex bg-white rounded-lg border p-1">
                        {['All', 'Inspected', 'Pending', 'Rejected'].map(filter => (
                            <button key={filter} className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-md">
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50">
                        <History className="h-4 w-4" />
                        Gate Pass Log
                    </button>
                    <button
                        onClick={() => setView('RECEIVE')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800"
                    >
                        <Warehouse className="h-4 w-4" />
                        Receive Goods
                    </button>
                </div>
            </div>

            {/* GRN Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">GRN Number</th>
                            <th className="px-6 py-4">Source PO</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4">Date Received</th>
                            <th className="px-6 py-4">Inspection</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MOCK_GRNS.map(grn => (
                            <tr key={grn.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{grn.id}</td>
                                <td className="px-6 py-4 text-gray-600">{grn.poNumber}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 font-sans">
                                            {grn.supplier.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-900">{grn.supplier}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{grn.receivedDate}</td>
                                <td className="px-6 py-4">
                                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-max",
                                        grn.inspection === 'Passed' ? 'bg-green-50 text-green-700' :
                                            grn.inspection === 'Failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                    )}>
                                        {grn.inspection === 'Passed' && <ShieldCheck className="h-3 w-3" />}
                                        {grn.inspection === 'Failed' && <AlertTriangle className="h-3 w-3" />}
                                        {grn.inspection === 'In Progress' && <Beaker className="h-3 w-3" />}
                                        {grn.inspection}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={clsx("px-2 py-1 rounded-md text-[10px] font-bold",
                                        grn.status === 'Fully Received' ? 'text-green-600 bg-green-50' :
                                            grn.status === 'Quarantined' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                                    )}>
                                        {grn.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const ReceiveFlow = () => (
        <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-gray-50 rounded-full border border-gray-100">
                    <ArrowRight className="h-5 w-5 rotate-180 text-gray-500" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Receive Goods</h2>
                    <p className="text-sm text-gray-500">Scan PO or Enter Document Number to Start</p>
                </div>
            </div>

            <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center">
                <div className="h-20 w-20 rounded-2xl bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center mx-auto mb-6">
                    <ClipboardCheck className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Initiate Inbound Receipt</h3>
                <p className="text-sm text-gray-500 mb-8">Enter the Purchase Order number or scan the delivery note barcode to begin quantity and quality verification.</p>

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Scan or Enter PO Number (e.g., PO-2026-8805)"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                    <button className="bg-[#2a2b2d] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-shadow shadow-lg">
                        Verify PO
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full">
            {view === 'DASHBOARD' && <GRNDashboard />}
            {view === 'RECEIVE' && <ReceiveFlow />}
        </div>
    );
}
