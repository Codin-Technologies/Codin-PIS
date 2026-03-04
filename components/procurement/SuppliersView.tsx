'use client';

import { useState } from 'react';
import {
    Users, Star, MapPin, Phone, Mail,
    ShieldCheck, Globe, Search, Filter,
    Plus, MoreHorizontal, ExternalLink,
    TrendingUp, AlertCircle, FileText
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { NewSupplierModal } from './NewSupplierModal';

const MOCK_SUPPLIERS = [
    {
        id: 'SUP-001',
        name: 'Premium Foods Ltd',
        category: 'Food & Beverage',
        rating: 4.8,
        location: 'London, UK',
        status: 'Active',
        reliability: 98,
        spend: '$145,000',
        contacts: 'John Doe',
        tags: ['Preferred', 'Bulk']
    },
    {
        id: 'SUP-002',
        name: 'Global Provisions',
        category: 'Dry Goods',
        rating: 4.5,
        location: 'New York, USA',
        status: 'Active',
        reliability: 94,
        spend: '$82,000',
        contacts: 'Jane Smith',
        tags: ['International']
    },
    {
        id: 'SUP-003',
        name: 'Winelands Estate',
        category: 'Wine & Spirits',
        rating: 4.9,
        location: 'Cape Town, SA',
        status: 'Active',
        reliability: 99,
        spend: '$210,000',
        contacts: 'Marius van Wyk',
        tags: ['Premium', 'Direct']
    },
    {
        id: 'SUP-004',
        name: 'CleanChem Inc',
        category: 'Cleaning Supplies',
        rating: 4.2,
        location: 'Berlin, Germany',
        status: 'Under Review',
        reliability: 88,
        spend: '$12,500',
        contacts: 'Hans Müller',
        tags: ['Eco-Friendly']
    }
];

const SUPPLIER_STATS = [
    { label: 'Total Suppliers', value: '142', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Avg lead time', value: '2.4 Days', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Risk Alerts', value: '3', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Preferred Partners', value: '12', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
];

export function SuppliersView() {
    const [view, setView] = useState<'GRID' | 'LIST' | 'DETAIL'>('GRID');
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <NewSupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Supplier Directory</h2>
                    <p className="text-sm text-gray-500">Manage and evaluate your supply chain partners</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search suppliers..." className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]" />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800"
                    >
                        <Plus className="h-4 w-4" />
                        Add Supplier
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
                {SUPPLIER_STATS.map((stat, idx) => (
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

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_SUPPLIERS.map((supplier) => (
                    <motion.div
                        key={supplier.id}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => { setSelectedSupplier(supplier); setView('DETAIL'); }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                <span className="text-lg font-bold text-gray-400">{supplier.name.charAt(0)}</span>
                            </div>
                            <span className={clsx("px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                supplier.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                            )}>
                                {supplier.status}
                            </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg">{supplier.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{supplier.category}</p>

                        <div className="space-y-2 mb-6 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                {supplier.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                <span className="font-bold">{supplier.rating}</span>
                                <span className="text-gray-400">• Reliability {supplier.reliability}%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Total Spend</p>
                                <p className="text-sm font-bold text-gray-900">{supplier.spend}</p>
                            </div>
                            <div className="flex -space-x-2">
                                {supplier.tags.map((tag, i) => (
                                    <div key={i} className="h-6 px-2 rounded-full bg-gray-100 border border-white text-[10px] flex items-center justify-center font-medium capitalize">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
