'use client';

import { useState } from 'react';
import {
    BadgeDollarSign, PieChart, TrendingUp,
    AlertCircle, Calendar, ArrowUpRight,
    ArrowDownRight, MoreHorizontal, Filter,
    Briefcase, Utensils, Zap, HardHat
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const MOCK_BUDGETS = [
    {
        id: 'B2026-KITCH',
        name: 'Kitchen & F&B',
        allocated: 150000,
        spent: 98450,
        committed: 12500,
        lastYear: 142000,
        status: 'On Track',
        icon: Utensils,
        color: 'bg-orange-500'
    },
    {
        id: 'B2026-MAINT',
        name: 'Maintenance & Repairs',
        allocated: 45000,
        spent: 42100,
        committed: 1500,
        lastYear: 38000,
        status: 'Warning',
        icon: HardHat,
        color: 'bg-blue-500'
    },
    {
        id: 'B2026-OPS',
        name: 'Operations & Utilities',
        allocated: 85000,
        spent: 52000,
        committed: 8000,
        lastYear: 82000,
        status: 'On Track',
        icon: Zap,
        color: 'bg-emerald-500'
    },
    {
        id: 'B2026-ADMIN',
        name: 'Administration',
        allocated: 25000,
        spent: 24800,
        committed: 500,
        lastYear: 22000,
        status: 'Critical',
        icon: Briefcase,
        color: 'bg-red-500'
    }
];

const BUDGET_STATS = [
    { label: 'Annual Budget', value: '$305,000', icon: BadgeDollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Spent', value: '$217,350', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Remaining', value: '$87,650', icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Over-budget Items', value: '2', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
];

export function BudgetView() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
                    <p className="text-sm text-gray-500">FY 2026 Procurement Spending Control</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50">
                        <Calendar className="h-4 w-4" />
                        Fiscal Period
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800">
                        <ArrowUpRight className="h-4 w-4" />
                        Adjust Budget
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
                {BUDGET_STATS.map((stat, idx) => (
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

            {/* Budget Progress Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {MOCK_BUDGETS.map((budget) => {
                    const percent = (budget.spent / budget.allocated) * 100;
                    const committedPercent = (budget.committed / budget.allocated) * 100;

                    return (
                        <div key={budget.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={clsx("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg", budget.color)}>
                                        <budget.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{budget.name}</h3>
                                        <p className="text-xs text-gray-500">{budget.id}</p>
                                    </div>
                                </div>
                                <span className={clsx("px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                    budget.status === 'On Track' ? 'bg-green-50 text-green-700' :
                                        budget.status === 'Warning' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                )}>
                                    {budget.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-400">Spending Progress</span>
                                    <span className="text-gray-900">{Math.round(percent)}%</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                    <div
                                        className={clsx("h-full transition-all duration-1000", budget.color)}
                                        style={{ width: `${percent}%` }}
                                    />
                                    <div
                                        className="h-full bg-gray-300 transition-all duration-1000 opacity-50"
                                        style={{ width: `${committedPercent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-400">
                                    <span>Spent: ${budget.spent.toLocaleString()}</span>
                                    <span>Committed: ${budget.committed.toLocaleString()}</span>
                                    <span>Total: ${budget.allocated.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">vs Last Year</p>
                                    <div className="flex items-center gap-1">
                                        {budget.spent > budget.lastYear ? (
                                            <ArrowUpRight className="h-3 w-3 text-red-500" />
                                        ) : (
                                            <ArrowDownRight className="h-3 w-3 text-green-500" />
                                        )}
                                        <span className={clsx("text-xs font-bold",
                                            budget.spent > budget.lastYear ? 'text-red-500' : 'text-green-500'
                                        )}>
                                            {Math.abs(Math.round(((budget.spent - budget.lastYear) / budget.lastYear) * 100))}%
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <button className="text-xs font-bold text-indigo-600 hover:underline">
                                        View Breakdown
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
