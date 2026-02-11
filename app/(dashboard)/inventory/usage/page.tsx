'use client';

import { useState } from 'react';
import { Plus, Search, Filter, FileText, Calendar, Trash2 } from 'lucide-react';
import { NewUsageModal } from '@/components/inventory/NewUsageModal';
import clsx from 'clsx';

export default function DailyStockUsagePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock History Data
    const [usageHistory, setUsageHistory] = useState<any[]>([
        { id: 1, date: '2026-01-20', reason: 'Waste', itemsCount: 2, recordedBy: 'Chef Kelvin', status: 'Recorded' },
        { id: 2, date: '2026-01-19', reason: 'Consumption', itemsCount: 15, recordedBy: 'Chef Kelvin', status: 'Recorded' },
    ]);

    const handleNewUsage = (data: any) => {
        const newRecord = {
            id: Date.now(),
            date: data.date,
            reason: data.reason,
            itemsCount: data.items.length,
            recordedBy: 'Current User', // Mock
            status: 'Recorded'
        };
        setUsageHistory([newRecord, ...usageHistory]);
    };

    return (
        <div className="h-full flex flex-col space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Stock Usage</h1>
                    <p className="text-sm text-gray-500">Track inventory consumption and waste</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#2a2b2d] text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg"
                >
                    <Plus className="h-5 w-5" />
                    Record Usage
                </button>
            </div>

            {/* List View */}
            <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header / Filter */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-xl text-sm font-bold bg-[#2a2b2d] text-white shadow-md">
                            All Records
                        </button>
                        <button className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-50 text-gray-600 hover:bg-gray-100">
                            Waste Only
                        </button>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a2b2d] w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Date / ID</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Recorded By</th>
                                <th className="px-6 py-4 rounded-tr-xl">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usageHistory.map((record) => (
                                <tr key={record.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{record.date}</p>
                                                <p className="text-xs text-gray-500">ID: #{record.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-bold",
                                            record.reason === 'Waste' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                                        )}>
                                            {record.reason}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">
                                        {record.itemsCount} items
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {record.recordedBy}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <FileText className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {usageHistory.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No usage records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <NewUsageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleNewUsage}
            />
        </div>
    );
}
