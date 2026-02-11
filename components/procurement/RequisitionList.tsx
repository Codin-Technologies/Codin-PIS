'use client';

import { useState } from 'react';
import {
    Search, Filter, MoreHorizontal, CheckCircle,
    Clock, XCircle, AlertCircle, FileText, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// Mock Data
import { RequisitionDetailModal } from './RequisitionDetailModal';

export const MOCK_REQUISITIONS = [
    { id: 'REQ-2024-001', requestedBy: 'Chef Kelvin', dept: 'Kitchen', subject: 'Weekend Beef Stock', value: 2450.00, date: '2026-01-19', status: 'Pending', priority: 'High' },
    { id: 'REQ-2024-002', requestedBy: 'Sarah (Bar Mgr)', dept: 'Bar', subject: 'Gin & Tonics Restock', value: 1200.50, date: '2026-01-18', status: 'Approved', priority: 'Normal' },
    { id: 'REQ-2024-003', requestedBy: 'Housekeeping', dept: 'Housekeeping', subject: 'Cleaning Detergents', value: 450.00, date: '2026-01-18', status: 'Ordered', priority: 'Normal' },
    { id: 'REQ-2024-004', requestedBy: 'Chef Kelvin', dept: 'Kitchen', subject: 'Emergency Tomato Paste', value: 85.00, date: '2026-01-17', status: 'Delivered', priority: 'Emergency' },
    { id: 'REQ-2024-005', requestedBy: 'Front Desk', dept: 'Admin', subject: 'Office Supplies', value: 120.00, date: '2026-01-15', status: 'Rejected', priority: 'Low' },
];

const STATUS_CONFIG: Record<string, any> = {
    'Pending': { color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
    'Approved': { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle },
    'Ordered': { color: 'text-purple-600', bg: 'bg-purple-50', icon: FileText },
    'Delivered': { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
    'Rejected': { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

export function RequisitionList() {
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReq, setSelectedReq] = useState<any>(null);

    // Mock Status Update for Demo
    const updateStatus = (id: string, newStatus: string) => {
        const idx = MOCK_REQUISITIONS.findIndex(r => r.id === id);
        if (idx >= 0) {
            MOCK_REQUISITIONS[idx].status = newStatus;
            setSelectedReq(null); // Close modal
            alert(`Requisition ${id} has been ${newStatus}!`);
        }
    };

    const filteredReqs = MOCK_REQUISITIONS.filter(req =>
        (filterStatus === 'All' || req.status === filterStatus) &&
        (req.subject.toLowerCase().includes(searchTerm.toLowerCase()) || req.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <RequisitionDetailModal
                requisition={selectedReq}
                isOpen={!!selectedReq}
                onClose={() => setSelectedReq(null)}
                onApprove={() => updateStatus(selectedReq.id, 'Approved')}
                onReject={() => updateStatus(selectedReq.id, 'Rejected')}
            />

            {/* Header / Controls */}
            <div className="p-6 border-b border-gray-100 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Pending', 'Approved', 'Ordered', 'Delivered', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors",
                                filterStatus === status
                                    ? 'bg-[#2a2b2d] text-white shadow-md'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Requisitions..."
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a2b2d] w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-0 md:p-2">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs hidden md:table-header-group">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-xl">Requisition Details</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Value</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 rounded-tr-xl">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredReqs.map((req) => {
                            const StatusIcon = STATUS_CONFIG[req.status]?.icon || AlertCircle;
                            return (
                                <tr
                                    key={req.id}
                                    onClick={() => setSelectedReq(req)}
                                    className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                                                {req.requestedBy.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{req.subject}</p>
                                                <p className="text-xs text-gray-500">{req.id} • {req.date} • {req.requestedBy}</p>
                                            </div>
                                            {req.priority === 'Emergency' && (
                                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                    URGENT
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="font-medium text-gray-700">{req.dept}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        ${req.value.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                                            STATUS_CONFIG[req.status].bg,
                                            STATUS_CONFIG[req.status].color
                                        )}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredReqs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <FileText className="h-12 w-12 mb-2 opacity-50" />
                        <p>No requisitions found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
