'use client';

import { useState } from 'react';
import {
    Clock, CheckCircle, AlertTriangle, Truck,
    FileText, Plus, Search, Filter, MoreHorizontal,
    ArrowRight, DollarSign, Calendar, Eye, Download,
    RotateCcw, ShieldCheck, Link as LinkIcon
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// --- Mock Data ---
const MOCK_POS = [
    { id: 'PO-2026-8801', supplier: 'Premium Foods Ltd', date: '2026-01-20', delivery: '2026-01-25', amount: 12500, status: 'Open', payment: 'Net 30', progress: 0 },
    { id: 'PO-2026-8802', supplier: 'Global Provisions', date: '2026-01-18', delivery: '2026-01-22', amount: 3450, status: 'Acknowledged', payment: 'Net 60', progress: 25 },
    { id: 'PO-2026-8803', supplier: 'Winelands Estate', date: '2026-01-15', delivery: '2026-01-19', amount: 8900, status: 'Overdue', payment: 'COD', progress: 0 },
    { id: 'PO-2026-8799', supplier: 'CleanChem Inc', date: '2026-01-10', delivery: '2026-01-12', amount: 1200, status: 'Received', payment: 'Net 30', progress: 100 },
];

const PO_STATS = [
    { label: 'Open PO Value', value: '$24,850', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Overdue Delivery', value: '1', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Contract Compliance', value: '98.5%', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Lead Time', value: '3.2 Days', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
];

// --- Sub-Components ---

export function PurchaseOrderView({ initialView = 'DASHBOARD' }: { initialView?: 'DASHBOARD' | 'CREATE' | 'DETAIL' }) {
    const [view, setView] = useState<'DASHBOARD' | 'CREATE' | 'DETAIL'>(initialView);
    const [selectedPO, setSelectedPO] = useState<any>(null);

    const PODashboard = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
                {PO_STATS.map((stat, idx) => (
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
                    <h3 className="text-lg font-bold text-gray-900">Purchase Orders</h3>
                    <div className="flex bg-white rounded-lg border p-1">
                        {['All', 'Open', 'Overdue', 'Closed'].map(filter => (
                            <button key={filter} className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-md">
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search POs..." className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]" />
                    </div>
                    <button
                        onClick={() => setView('CREATE')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800"
                    >
                        <Plus className="h-4 w-4" />
                        Create PO
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">PO Number</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4">Dates</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MOCK_POS.map(po => (
                            <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {po.id}
                                    <span className="block text-[10px] text-gray-400 font-normal">Linked: RFQ-2026-001</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{po.supplier.charAt(0)}</div>
                                        <div>
                                            <p className="font-medium text-gray-900">{po.supplier}</p>
                                            <p className="text-xs text-gray-500">{po.payment}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-400">Created: {po.date}</span>
                                        <span className={clsx("font-bold text-xs flex items-center gap-1",
                                            po.status === 'Overdue' ? 'text-red-600' : 'text-green-600'
                                        )}>
                                            <Calendar className="h-3 w-3" />
                                            Due: {po.delivery}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">${po.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={clsx("px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1",
                                        po.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                                            po.status === 'Acknowledged' ? 'bg-purple-100 text-purple-700' :
                                                po.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                                    'bg-green-100 text-green-700'
                                    )}>
                                        {po.status === 'Open' && <Clock className="h-3 w-3" />}
                                        {po.status === 'Acknowledged' && <CheckCircle className="h-3 w-3" />}
                                        {po.status === 'Overdue' && <AlertTriangle className="h-3 w-3" />}
                                        {po.status === 'Received' && <Truck className="h-3 w-3" />}
                                        {po.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => { setSelectedPO(po); setView('DETAIL'); }}
                                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"
                                    >
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

    const POCreate = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowRight className="h-6 w-6 rotate-180 text-gray-500" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Generate Purchase Order</h2>
                    <p className="text-xs text-gray-500">Drafting PO-2026-8804 from RFQ-2026-004</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Details */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Order Header</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Supplier</label>
                                <select className="w-full border p-2 rounded-lg text-sm bg-gray-50" disabled>
                                    <option>Premium Foods Ltd</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Incoterms</label>
                                <select className="w-full border p-2 rounded-lg text-sm">
                                    <option>DDP - Delivered Duty Paid</option>
                                    <option>EXW - Ex Works</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Delivery Location</label>
                                <select className="w-full border p-2 rounded-lg text-sm">
                                    <option>Central Warehouse (WH-01)</option>
                                    <option>Kitchen Outlet (K-05)</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Req. Delivery Date</label>
                                <input type="date" className="w-full border p-2 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Item Lines */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 text-sm uppercase">Item Lines</h3>
                            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Contract Prices Applied</span>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="text-gray-400 text-xs uppercase border-b">
                                <tr>
                                    <th className="py-2">Item</th>
                                    <th className="py-2 w-24">Qty</th>
                                    <th className="py-2 w-24">Unit</th>
                                    <th className="py-2 w-24 text-right">Price</th>
                                    <th className="py-2 w-24 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr>
                                    <td className="py-3 font-medium">Premium Beef Cuts (Grade A)</td>
                                    <td className="py-3">
                                        <input type="number" defaultValue={50} className="w-16 border rounded px-1 text-center" />
                                    </td>
                                    <td className="py-3 text-gray-500">kg</td>
                                    <td className="py-3 text-right text-gray-600">$18.50</td>
                                    <td className="py-3 text-right font-bold">$925.00</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-medium">Whole Milk (Organic)</td>
                                    <td className="py-3">
                                        <input type="number" defaultValue={100} className="w-16 border rounded px-1 text-center" />
                                    </td>
                                    <td className="py-3 text-gray-500">L</td>
                                    <td className="py-3 text-right text-gray-600">$1.50</td>
                                    <td className="py-3 text-right font-bold">$150.00</td>
                                </tr>
                            </tbody>
                            <tfoot className="border-t">
                                <tr>
                                    <td colSpan={4} className="py-4 text-right font-bold text-gray-500">Total Net Amount</td>
                                    <td className="py-4 text-right font-bold text-xl text-gray-900">$1,075.00</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">System Controls</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                <span>Budget Validated</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                <span>MOQ Met (50kg)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                <span>Supplier Licensed</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => { alert('PO Generated and Sent to Supplier!'); setView('DASHBOARD'); }}
                        className="w-full py-4 bg-[#2a2b2d] text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                    >
                        <FileText className="h-5 w-5" />
                        Generate & Send PO
                    </button>
                    <button
                        onClick={() => setView('DASHBOARD')}
                        className="w-full py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50"
                    >
                        Save Draft
                    </button>
                </div>
            </div>
        </div>
    );

    const PODetail = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowRight className="h-6 w-6 rotate-180 text-gray-500" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">{selectedPO.id}</h2>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">{selectedPO.status}</span>
                        </div>
                        <p className="text-xs text-gray-500">Supplier: {selectedPO.supplier} • Sent: {selectedPO.date}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600">
                        <Download className="h-4 w-4" />
                        PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600">
                        <RotateCcw className="h-4 w-4" />
                        Amend
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline / Progress */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    {['PO Generated', 'Acknowledged', 'In Transit', 'Received', 'Invoiced'].map((step, i) => (
                        <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs",
                                i === 0 ? "bg-green-600 border-green-600 text-white" :
                                    (i === 1 && selectedPO.status === 'Acknowledged') ? "bg-green-600 border-green-600 text-white" :
                                        "bg-white border-gray-200 text-gray-300"
                            )}>
                                {i + 1}
                            </div>
                            <span className={clsx("text-xs font-bold", i === 0 ? "text-gray-900" : "text-gray-400")}>{step}</span>
                        </div>
                    ))}
                    {/* Line behind steps would go here in detailed CSS */}
                </div>

                {/* Left: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Supplier Acknowledgement</h3>

                        {selectedPO.status === 'Open' ? (
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start gap-4">
                                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-orange-800 text-sm">Pending Action</h4>
                                    <p className="text-xs text-orange-700 mt-1 mb-3">Supplier has not yet acknowledged this order.</p>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-white border border-orange-200 text-orange-700 text-xs font-bold rounded-lg shadow-sm hover:bg-orange-100">
                                            Send Reminder
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newPO = { ...selectedPO, status: 'Acknowledged' };
                                                setSelectedPO(newPO); // Local Mock Update
                                                alert('Simulated: Supplier Acknowledged via Portal');
                                            }}
                                            className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-orange-700"
                                        >
                                            Simulate Acknowledgement
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <h4 className="font-bold text-green-800 text-sm">Acknowledged</h4>
                                    <p className="text-xs text-green-700">Delivery confirmed for {selectedPO.delivery}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Order Summary</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Net</span>
                                <span className="font-medium">${selectedPO.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tax (10%)</span>
                                <span className="font-medium">${(selectedPO.amount * 0.1).toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between">
                                <span className="font-bold text-gray-900">Grand Total</span>
                                <span className="font-bold text-xl text-gray-900">${(selectedPO.amount * 1.1).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full">
            {view === 'DASHBOARD' && <PODashboard />}
            {view === 'CREATE' && <POCreate />}
            {view === 'DETAIL' && selectedPO && <PODetail />}
        </div>
    );
}
