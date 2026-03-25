'use client';

import { useState } from 'react';
import { Plus, Search, FileText, Calendar, Loader2 } from 'lucide-react';
import { NewUsageModal } from '@/components/inventory/NewUsageModal';
import { UsageDetailModal } from '@/components/inventory/UsageDetailModal';
import { useInventoryUsage } from '@/hooks/useInventory';
import { useBranch } from '@/hooks/useBranch';
import clsx from 'clsx';

export default function DailyStockUsagePage() {
    const { branchId } = useBranch();
    const { data: usageResponse, isLoading } = useInventoryUsage(branchId);
    const usageHistory = usageResponse?.data ?? [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsageId, setSelectedUsageId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const filteredUsage = usageHistory.filter(record => 
        record.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.recordedBy.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRowClick = (id: string) => {
        setSelectedUsageId(id);
        setIsDetailModalOpen(true);
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
                    className="flex items-center gap-2 bg-[#2a2b2d] text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
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
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 border-b border-gray-100">Date / ID</th>
                                <th className="px-6 py-4 border-b border-gray-100">Reason</th>
                                <th className="px-6 py-4 border-b border-gray-100">Items</th>
                                <th className="px-6 py-4 border-b border-gray-100">Recorded By</th>
                                <th className="px-6 py-4 border-b border-gray-100 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Loader2 className="h-8 w-8 text-[#2a2b2d] animate-spin" />
                                            <p className="text-gray-500 font-medium">Loading usage records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsage.map((record) => (
                                <tr 
                                    key={record.id} 
                                    className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleRowClick(record.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{record.date}</p>
                                                <p className="text-[10px] font-mono text-gray-400">ID: {record.id.split('-')[0]}...</p>
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
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{record.recordedBy.fullName}</span>
                                            <span className="text-xs text-gray-500">{record.recordedBy.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-[#2a2b2d] transition-colors p-2 hover:bg-gray-100 rounded-lg">
                                            <FileText className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filteredUsage.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic font-medium">
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
            />

            <UsageDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                usageId={selectedUsageId}
            />
        </div>
    );
}
