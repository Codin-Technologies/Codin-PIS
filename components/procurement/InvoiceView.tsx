'use client';

import { useState } from 'react';
import {
    Receipt, CheckCircle, AlertTriangle,
    FileText, Calendar, Search, Filter,
    Plus, MoreHorizontal, Eye, Download,
    ShieldCheck, DollarSign, Clock, ArrowRight,
    Link as LinkIcon, BadgeCheck, XCircle
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const MOCK_INVOICES = [
    {
        id: 'INV-2026-4401',
        poNumber: 'PO-2026-8799',
        supplier: 'CleanChem Inc',
        amount: 1320.00,
        dueDate: '2026-02-12',
        status: 'Paid',
        match: 'Matched (3-Way)',
        source: 'Portal'
    },
    {
        id: 'INV-2026-4402',
        poNumber: 'PO-2026-8801',
        supplier: 'Premium Foods Ltd',
        amount: 13750.00,
        dueDate: '2026-02-22',
        status: 'Pending Approval',
        match: 'Matched (3-Way)',
        source: 'Email / OCR'
    },
    {
        id: 'INV-2026-4403',
        poNumber: 'PO-2026-8802',
        supplier: 'Global Provisions',
        amount: 3450.00,
        dueDate: '2026-01-28',
        status: 'Discrepancy',
        match: 'PO Mismatch',
        source: 'Physical Scan'
    },
    {
        id: 'INV-2026-4404',
        poNumber: 'PO-2026-8803',
        supplier: 'Winelands Estate',
        amount: 8900.00,
        dueDate: '2026-02-15',
        status: 'Draft',
        match: 'Pending GRN',
        source: 'Manual Entry'
    }
];

const INVOICE_STATS = [
    { label: 'Unpaid Invoices', value: '$26,100', icon: Receipt, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Match', value: '3', icon: LinkIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Payment Cycle', value: '8.5 Days', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Audit Compliance', value: '100%', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
];

export function InvoiceView() {
    const [view, setView] = useState<'DASHBOARD' | 'DETAIL'>('DASHBOARD');

    const InvoiceDashboard = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
                {INVOICE_STATS.map((stat, idx) => (
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
                    <h3 className="text-lg font-bold text-gray-900">Accounts Payable</h3>
                    <div className="flex bg-white rounded-lg border p-1">
                        {['All', 'Awaiting Action', 'Matched', 'Paid'].map(filter => (
                            <button key={filter} className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-md">
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search invoices..." className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800">
                        <Plus className="h-4 w-4" />
                        Capture Invoice
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4">Match Status</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MOCK_INVOICES.map(inv => (
                            <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{inv.id}</span>
                                        <span className="text-[10px] text-gray-400">PO: {inv.poNumber}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-gray-900">{inv.supplier}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">${inv.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-gray-600">{inv.dueDate}</td>
                                <td className="px-6 py-4">
                                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-max",
                                        inv.match.includes('Matched') ? 'bg-green-50 text-green-700' :
                                            inv.match.includes('Pending') ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                                    )}>
                                        {inv.match.includes('Matched') && <BadgeCheck className="h-3 w-3" />}
                                        {inv.match.includes('Pending') && <Clock className="h-3 w-3" />}
                                        {inv.match.includes('Mismatch') && <XCircle className="h-3 w-3" />}
                                        {inv.match}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={clsx("px-2 py-1 rounded-md text-[10px] font-bold",
                                        inv.status === 'Paid' ? 'text-green-600 bg-green-50' :
                                            inv.status === 'Discrepancy' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                                    )}>
                                        {inv.status}
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

    return (
        <div className="h-full">
            <InvoiceDashboard />
        </div>
    );
}
