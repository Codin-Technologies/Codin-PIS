'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, Minus, Filter, AlertTriangle, CheckCircle, Package, ClipboardList } from 'lucide-react';
import clsx from 'clsx';

import { AddItemModal } from '@/components/inventory/AddItemModal';

const INITIAL_DEPARTMENTS = ['All', 'Kitchen', 'Bar', 'Housekeeping', 'Front Desk'];

const INITIAL_INVENTORY = [
    { id: 1, name: 'Tomatoes', sku: 'VEG-001', dept: 'Kitchen', qty: 45, unit: 'kg', status: 'Good', image: '🍅' },
    { id: 2, name: 'Beef Patties', sku: 'MEA-002', dept: 'Kitchen', qty: 120, unit: 'pcs', status: 'Good', image: '🥩' },
    { id: 3, name: 'Red Wine', sku: 'BEV-005', dept: 'Bar', qty: 8, unit: 'btl', status: 'Low', image: '🍷' },
    { id: 4, name: 'Dish Soap', sku: 'CLN-001', dept: 'Housekeeping', qty: 2, unit: 'L', status: 'Critical', image: '🧼' },
    { id: 5, name: 'Rice', sku: 'GRN-003', dept: 'Kitchen', qty: 50, unit: 'kg', status: 'Good', image: '🍚' },
    { id: 6, name: 'Pasta', sku: 'GRN-004', dept: 'Kitchen', qty: 30, unit: 'kg', status: 'Good', image: '🍝' },
];

export default function InventoryPage() {
    const router = useRouter();
    const [inventory, setInventory] = useState(INITIAL_INVENTORY);
    const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
    const [selectedDept, setSelectedDept] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddingDept, setIsAddingDept] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');

    const filteredItems = inventory.filter(item =>
        (selectedDept === 'All' || item.dept === selectedDept) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const lowStockItems = inventory.filter(i => i.status === 'Low' || i.status === 'Critical');

    const handleAddItem = (newItem: any) => {
        setInventory([newItem, ...inventory]);
    };

    const handleAddDept = () => {
        if (!newDeptName) return;
        if (!departments.includes(newDeptName)) {
            setDepartments([...departments, newDeptName]);
        }
        setIsAddingDept(false);
        setNewDeptName('');
    };

    // Check for 'new-item' action in URL
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('action') === 'new-item') {
            setIsAddModalOpen(true);
            // Optional: clear the param so it doesn't reopen on refresh, 
            // but for now keeping it simple or user might want to bookmark.
            // To clear: router.replace('/inventory');
        }
    }, [searchParams]);

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddItem}
                departments={departments}
            />

            {/* Left Section: Inventory Grid */}
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">

                {/* Header & Controls */}
                <div className="flex flex-col space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">Inventory Items</h1>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/inventory/usage')}
                                className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
                            >
                                <ClipboardList className="h-4 w-4" />
                                <span>Record Usage</span>
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center space-x-2 rounded-xl bg-[#2a2b2d] px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 shadow-lg"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Item</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 text-sm">
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-full bg-gray-50 border-none py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-[#2a2b2d] sm:leading-6"
                                placeholder="Search by Name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 items-center">
                            {departments.map((dept) => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className={clsx(
                                        "rounded-full px-4 py-1.5 font-medium whitespace-nowrap transition-colors",
                                        selectedDept === dept ? 'bg-[#2a2b2d] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    )}
                                >
                                    {dept}
                                </button>
                            ))}

                            {/* Add Dept Button */}
                            {isAddingDept ? (
                                <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 ring-1 ring-gray-200">
                                    <input
                                        autoFocus
                                        className="bg-transparent border-none text-xs w-24 focus:ring-0"
                                        placeholder="Name..."
                                        value={newDeptName}
                                        onChange={e => setNewDeptName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddDept()}
                                        onBlur={() => { if (!newDeptName) setIsAddingDept(false); }}
                                    />
                                    <button onClick={handleAddDept} className="p-1 hover:text-green-600"><Plus className="h-3 w-3" /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingDept(true)}
                                    className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                    title="Add Department"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Item Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="group flex items-center space-x-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl">
                                {item.image}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="truncate text-base font-bold text-gray-900">{item.name}</h3>
                                    <span className={clsx(
                                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                        item.status === 'Good' ? 'bg-green-50 text-green-700' :
                                            item.status === 'Low' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                                    )}>
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">{item.sku} • {item.dept}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-bold text-gray-900">{item.qty} <span className="text-xs font-normal text-gray-500">{item.unit}</span></span>
                                    <div className="flex space-x-1">
                                        <button className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <button className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-500">
                            No items found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section: Alerts & Summary */}
            <div className="w-80 hidden lg:flex flex-col gap-6 h-full">

                {/* Low Stock Alert Panel */}
                <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Alerts</h2>
                            <p className="text-xs text-gray-500">Items requiring attention</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                        {lowStockItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
                                <div className="flex items-center space-x-3">
                                    <div className="text-xl">{item.image}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                        <p className="text-xs text-red-600 font-medium">Only {item.qty} {item.unit} left</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {lowStockItems.length === 0 && (
                            <div className="text-center py-6">
                                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">All stock levels good!</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View Procurement</button>
                    </div>
                </div>

                {/* Quick Stats or Actions */}
                <div className="rounded-2xl bg-[#2a2b2d] p-6 shadow-lg text-white">
                    <h3 className="font-bold text-lg mb-1">Total Valuation</h3>
                    <p className="text-3xl font-bold mb-4">$12,450</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-300 bg-white/10 p-2 rounded-lg">
                        <Package className="h-4 w-4" />
                        <span>245 Total Items</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
