'use client';

import { useState } from 'react';
import {
    Plus, Search, Filter, ArrowRight, CheckCircle,
    XCircle, Clock, TrendingUp, Users, DollarSign,
    FileText, ChevronRight, Award, AlertTriangle,
    BarChart3, ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type ViewState = 'DASHBOARD' | 'CREATE' | 'COMPARE';

// --- Mock Data ---
const MOCK_RFQS = [
    { id: 'RFQ-2026-001', title: 'Q1 Bulk Beef Procurement', status: 'Active', closingIn: '2 days', participation: '3/5', savings: '-', items: 4 },
    { id: 'RFQ-2026-002', title: 'Cleaning Supplies Annual Contract', status: 'Evaluating', closingIn: 'Closed', participation: '4/4', savings: '12%', items: 15 },
    { id: 'RFQ-2026-003', title: 'Kitchen Equipment Upgrade', status: 'Draft', closingIn: '-', participation: '-', savings: '-', items: 2 },
];

const MOCK_SUPPLIERS = [
    { id: 1, name: 'Premium Foods Ltd', score: 98, status: 'Preferred' },
    { id: 2, name: 'Global Provisions', score: 85, status: 'Approved' },
    { id: 3, name: 'Local Farmers Co-op', score: 92, status: 'Preferred' },
    { id: 4, name: 'Budget Supplies Inc', score: 71, status: 'Condtional' },
];

const MOCK_QUOTES = [
    { supplierId: 1, supplierName: 'Premium Foods Ltd', price: 12500, leadTime: '2 Days', quality: 'High', risk: 'Low', rank: 1, recommended: true },
    { supplierId: 2, supplierName: 'Global Provisions', price: 11800, leadTime: '5 Days', quality: 'Med', risk: 'Med', rank: 2, recommended: false },
    { supplierId: 3, supplierName: 'Local Farmers Co-op', price: 13000, leadTime: '1 Day', quality: 'High', risk: 'Low', rank: 3, recommended: false },
];

export function RFQView() {
    const [view, setView] = useState<ViewState>('DASHBOARD');
    const [selectedRfq, setSelectedRfq] = useState<string | null>(null);

    // --- Sub-Components ---

    const RFQDashboard = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: 'Active RFQs', val: '8', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Partic. Rate', val: '78%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Avg Savings', val: '14.2%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Contract Cover', val: '92%', icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">{kpi.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.val}</p>
                        </div>
                        <div className={clsx("h-12 w-12 rounded-xl flex items-center justify-center", kpi.bg, kpi.color)}>
                            <kpi.icon className="h-6 w-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Sourcing Events</h3>
                <button
                    onClick={() => setView('CREATE')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800"
                >
                    <Plus className="h-4 w-4" />
                    Create RFQ
                </button>
            </div>

            {/* RFQ List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">RFQ Details</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Closing</th>
                            <th className="px-6 py-4">Participation</th>
                            <th className="px-6 py-4">Est. Savings</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MOCK_RFQS.map(rfq => (
                            <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-900">{rfq.title}</p>
                                    <p className="text-xs text-gray-500">{rfq.id} • {rfq.items} Items</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={clsx("px-2 py-1 rounded-md text-xs font-bold",
                                        rfq.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                                            rfq.status === 'Evaluating' ? 'bg-purple-100 text-purple-700' :
                                                'bg-gray-100 text-gray-700'
                                    )}>{rfq.status}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium">{rfq.closingIn}</td>
                                <td className="px-6 py-4 text-gray-600">{rfq.participation}</td>
                                <td className="px-6 py-4 font-bold text-green-600">{rfq.savings}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => {
                                            if (rfq.status === 'Evaluating') {
                                                setSelectedRfq(rfq.id);
                                                setView('COMPARE');
                                            }
                                        }}
                                        className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                                    >
                                        {rfq.status === 'Evaluating' ? 'Compare Quotes' : 'Manage'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const CreateRFQ = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowRight className="h-6 w-6 rotate-180 text-gray-500" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Create Request for Quotation</h2>
                    <p className="text-xs text-gray-500">Drafting RFQ-2026-004</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. Header Details */}
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">1. Event Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                                <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. Q3 Packaging Sourcing" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Required Delivery</label>
                                <input type="date" className="w-full border p-2 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                                <select className="w-full border p-2 rounded-lg text-sm bg-white">
                                    <option>Food & Beverage</option>
                                    <option>Packaging</option>
                                    <option>Equipment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Payment Terms</label>
                                <select className="w-full border p-2 rounded-lg text-sm bg-white">
                                    <option>Net 30</option>
                                    <option>Net 60</option>
                                    <option>COD</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* 2. Items */}
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">2. Line Items</h3>
                        <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300 text-center">
                            <p className="text-sm text-gray-500 mb-2">Drag requisitions here or add manually</p>
                            <button className="text-blue-600 font-bold text-sm">+ Add Item</button>
                        </div>
                    </section>
                </div>

                {/* Sidebar: Suppliers */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">3. Invite Suppliers</h3>
                    <div className="space-y-3 mb-4">
                        {MOCK_SUPPLIERS.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer group">
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{s.name}</p>
                                    <div className="flex gap-2 text-[10px]">
                                        <span className="text-green-600 font-medium">{s.status}</span>
                                        <span className="text-gray-400">Score: {s.score}</span>
                                    </div>
                                </div>
                                <div className="h-5 w-5 rounded border border-gray-300 group-hover:border-blue-500"></div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => {
                        alert("RFQ Published to 3 Suppliers!");
                        setView('DASHBOARD');
                    }} className="w-full py-3 bg-[#2a2b2d] text-white rounded-xl font-bold shadow-lg hover:bg-gray-800">
                        Publish RFQ
                    </button>
                </div>
            </div>
        </div>
    );

    const QuoteComparison = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowRight className="h-6 w-6 rotate-180 text-gray-500" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Quote Comparison Engine</h2>
                    <p className="text-xs text-gray-500">Evaluating: {selectedRfq || 'Annual Contract'}</p>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-4 min-w-[800px]">

                    {/* Labels Column */}
                    <div className="bg-gray-50 p-6 border-r border-gray-100 flex flex-col gap-6 pt-32">
                        <div className="font-bold text-gray-400 text-xs uppercase h-8">Total Price</div>
                        <div className="font-bold text-gray-400 text-xs uppercase h-8">Lead Time</div>
                        <div className="font-bold text-gray-400 text-xs uppercase h-8">Quality Score</div>
                        <div className="font-bold text-gray-400 text-xs uppercase h-8">Risk Profile</div>
                    </div>

                    {/* Supplier Columns */}
                    {MOCK_QUOTES.map((quote, idx) => (
                        <div key={idx} className={clsx("p-6 flex flex-col relative border-r border-gray-100 last:border-0", quote.recommended ? 'bg-blue-50/30' : '')}>
                            {quote.recommended && (
                                <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-[10px] uppercase font-bold text-center py-1">
                                    System Recommendation
                                </div>
                            )}

                            {/* Header */}
                            <div className="text-center mb-8 mt-4">
                                <h3 className="font-bold text-lg text-gray-900">{quote.supplierName}</h3>
                                <div className="text-xs text-gray-500 mb-4">Rank #{quote.rank}</div>
                                <button className="w-full py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold hover:bg-gray-50">
                                    View Full Quote
                                </button>
                            </div>

                            {/* Metrics */}
                            <div className="flex flex-col gap-6">
                                <div className="h-8 flex items-center justify-center font-bold text-xl text-gray-900">
                                    ${quote.price.toLocaleString()}
                                </div>
                                <div className="h-8 flex items-center justify-center font-medium text-gray-700">
                                    {quote.leadTime}
                                </div>
                                <div className="h-8 flex items-center justify-center">
                                    <span className={clsx("px-2 py-1 rounded text-xs font-bold",
                                        quote.quality === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    )}>{quote.quality}</span>
                                </div>
                                <div className="h-8 flex items-center justify-center">
                                    <span className={clsx("px-2 py-1 rounded text-xs font-bold",
                                        quote.risk === 'Low' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    )}>{quote.risk}</span>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="mt-8">
                                <button onClick={() => {
                                    alert(`Bid Awarded to ${quote.supplierName}! Purchase Order Generated.`);
                                    setView('DASHBOARD');
                                }} className={clsx("w-full py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95",
                                    quote.recommended ? 'bg-[#2a2b2d] text-white hover:bg-gray-800' : 'bg-white border text-gray-700 hover:bg-gray-50'
                                )}>
                                    <div className="flex items-center justify-center gap-2">
                                        <Award className="h-4 w-4" />
                                        Award Contract
                                    </div>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full">
            {view === 'DASHBOARD' && <RFQDashboard />}
            {view === 'CREATE' && <CreateRFQ />}
            {view === 'COMPARE' && <QuoteComparison />}
        </div>
    );
}
