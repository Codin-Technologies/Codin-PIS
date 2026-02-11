'use client';

import {
    BarChart3, PieChart, TrendingUp, DollarSign,
    FileText, Calendar, Download, Printer, Filter
} from 'lucide-react';

const REPORT_CATEGORIES = [
    {
        title: 'Sales & Revenue',
        reports: [
            { name: 'Daily Sales Report', icon: BarChart3, desc: 'Breakdown of sales by hour, day, and week.' },
            { name: 'Product Mix', icon: PieChart, desc: 'Best selling items and category performance.' },
            { name: 'Payment Methods', icon: DollarSign, desc: 'Cash vs Card vs Digital Wallet splits.' },
        ]
    },
    {
        title: 'Inventory & Cost',
        reports: [
            { name: 'COGS Analysis', icon: TrendingUp, desc: 'Cost of Goods Sold vs Revenue.' },
            { name: 'Wastage Report', icon: FileText, desc: 'Recorded waste and shrinkage logs.' },
            { name: 'Low Stock History', icon: Calendar, desc: 'Frequency of stockouts and alerts.' },
        ]
    },
    {
        title: 'Staff Performance',
        reports: [
            { name: 'Shift Sales', icon: UsersIcon, desc: 'Revenue generated per staff member.' },
            { name: 'Labor Cost', icon: DollarSign, desc: 'Labor cost percentage vs revenue.' },
        ]
    }
];

// Helper icon
function UsersIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> }

export default function ReportsPage() {
    return (
        <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">

            {/* Header */}
            <div className="flex flex-col space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:flex-row sm:items-end sm:justify-between sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports Center</h1>
                    <p className="text-sm text-gray-500 mt-1">Generate insights to drive better decisions.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Filter className="h-4 w-4" />
                        <span>Filters</span>
                    </button>
                    <button className="flex items-center space-x-2 rounded-xl bg-[#2a2b2d] px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 shadow-lg">
                        <Download className="h-4 w-4" />
                        <span>Export All</span>
                    </button>
                </div>
            </div>

            {/* Report Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {REPORT_CATEGORIES.map((cat, idx) => (
                    <div key={idx} className="flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-gray-900 pl-2 border-l-4 border-pink-500">{cat.title}</h2>
                        <div className="space-y-4">
                            {cat.reports.map((report, rIdx) => (
                                <div key={rIdx} className="group flex items-start p-4 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:border-pink-200 transition-all cursor-pointer">
                                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-pink-50 group-hover:text-pink-600 transition-colors">
                                        <report.icon className="h-5 w-5" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{report.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{report.desc}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                        <Download className="h-4 w-4 text-gray-400 hover:text-gray-900" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Scheduled Reports Config */}
            <div className="rounded-2xl bg-[#1e1f21] p-6 text-white shadow-lg mt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold">Scheduled Exports</h3>
                        <p className="text-sm text-gray-400">Receive automated reports via email.</p>
                    </div>
                    <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
                        Manage Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}
