'use client';

import { useState } from 'react';
import { Search, X, Filter, ShoppingCart, Check, Plus } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded Mock Catalog Data
const CATALOG_ITEMS = [
    { id: 101, sku: 'VEG-TOM-001', name: 'Fresh Tomatoes', category: 'Vegetables', price: 2.50, unit: 'kg', image: '🍅' },
    { id: 102, sku: 'VEG-ONI-002', name: 'Red Onions', category: 'Vegetables', price: 1.80, unit: 'kg', image: '🧅' },
    { id: 103, sku: 'VEG-POT-003', name: 'Potatoes (Russet)', category: 'Vegetables', price: 1.20, unit: 'kg', image: '🥔' },
    { id: 201, sku: 'MEA-BEF-001', name: 'Premium Beef Cuts', category: 'Meat', price: 18.50, unit: 'kg', image: '🥩' },
    { id: 202, sku: 'MEA-CHK-002', name: 'Chicken Breast', category: 'Meat', price: 8.50, unit: 'kg', image: '🍗' },
    { id: 301, sku: 'DAI-MIL-001', name: 'Whole Milk', category: 'Dairy', price: 1.50, unit: 'L', image: '🥛' },
    { id: 302, sku: 'DAI-CHZ-002', name: 'Cheddar Cheese', category: 'Dairy', price: 12.00, unit: 'kg', image: '🧀' },
    { id: 401, sku: 'BEV-WIN-001', name: 'House Red Wine', category: 'Beverages', price: 12.00, unit: 'btl', image: '🍷' },
    { id: 402, sku: 'BEV-SDA-002', name: 'Cola Syrup', category: 'Beverages', price: 45.00, unit: 'can', image: '🥤' },
    { id: 501, sku: 'CLN-DET-001', name: 'Dish Detergent', category: 'Cleaning', price: 25.00, unit: 'drum', image: '🧼' },
];

const CATEGORIES = ['All', 'Vegetables', 'Meat', 'Dairy', 'Beverages', 'Cleaning'];

export function CatalogModal({ isOpen, onClose, onAddItems }: { isOpen: boolean; onClose: () => void; onAddItems: (items: any[]) => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // Custom Item Form State
    const [newItem, setNewItem] = useState({ name: '', sku: '', category: 'Vegetables', price: 0, unit: 'kg' });

    const filteredItems = CATALOG_ITEMS.filter(item =>
        (selectedCategory === 'All' || item.category === selectedCategory) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleItem = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(i => i !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleAdd = () => {
        const itemsToAdd = CATALOG_ITEMS.filter(item => selectedItems.includes(item.id));
        // Transform for Requisition Line Item format (add mock stock intel and INITIALIZE QTY to fix React warning)
        const transformedItems = itemsToAdd.map(item => ({
            ...item,
            qty: 1, // Fix: Initialize qty
            requiredBy: '', // Fix: Initialize requiredBy
            stock: Math.floor(Math.random() * 20),
            forecast: Math.floor(Math.random() * 50) + 10,
            daysCover: Math.floor(Math.random() * 10)
        }));
        onAddItems(transformedItems);
        setSelectedItems([]);
        onClose();
    };

    const handleCreateCustom = () => {
        if (!newItem.name || !newItem.sku) return;

        const customItem = {
            id: Date.now(), // Generate ID
            ...newItem,
            image: '📦', // Default icon
            qty: 1,
            requiredBy: '',
            stock: 0,
            forecast: 0,
            daysCover: 0
        };

        onAddItems([customItem]);
        setIsCreating(false);
        setNewItem({ name: '', sku: '', category: 'Vegetables', price: 0, unit: 'kg' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-5xl h-[80vh] bg-[#f8f9fc] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{isCreating ? 'Create New Item' : 'Supplier Catalog'}</h2>
                        <p className="text-sm text-gray-500">{isCreating ? 'Add a new item to this requisition' : 'Select items to add to your requisition'}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {!isCreating ? (
                    <>
                        {/* Filters & Search */}
                        <div className="px-6 py-4 bg-white border-b border-gray-200 flex gap-4 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by SKU or Name..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 items-center">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                                            selectedCategory === cat ? 'bg-[#2a2b2d] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {/* Create New Button Card */}
                                <div
                                    onClick={() => setIsCreating(true)}
                                    className="group cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-4 transition-all hover:border-gray-400 hover:bg-gray-50 flex flex-col items-center justify-center text-center h-full min-h-[200px]"
                                >
                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200">
                                        <Plus className="h-6 w-6 text-gray-500" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm">Create New</h3>
                                    <p className="text-xs text-gray-500">Item not in list?</p>
                                </div>

                                {filteredItems.map(item => {
                                    const isSelected = selectedItems.includes(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={clsx(
                                                "group cursor-pointer rounded-xl border p-4 transition-all relative",
                                                isSelected
                                                    ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500'
                                                    : 'bg-white border-gray-100 hover:shadow-md hover:border-gray-300'
                                            )}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                            )}
                                            <div className="h-16 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                                                {item.image}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                                                <p className="text-xs text-gray-500 mb-2">{item.sku}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-900 text-sm">${item.price.toFixed(2)}</span>
                                                    <span className="text-xs text-gray-400">/{item.unit}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {filteredItems.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                                    <p>No items found.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-600">
                                {selectedItems.length} items selected
                            </div>
                            <button
                                onClick={handleAdd}
                                disabled={selectedItems.length === 0}
                                className="rounded-xl bg-[#2a2b2d] px-8 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                            >
                                Add Selected Items
                            </button>
                        </div>
                    </>
                ) : (
                    /* CREATE MODE */
                    <div className="flex-1 flex flex-col p-8">
                        <div className="max-w-2xl mx-auto w-full space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Special Truffle Oil"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">SKU / Code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SPC-001"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                        value={newItem.sku}
                                        onChange={e => setNewItem({ ...newItem, sku: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Price</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                        value={newItem.price}
                                        onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2a2b2d]"
                                        value={newItem.unit}
                                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="lb">lb</option>
                                        <option value="L">L</option>
                                        <option value="btl">Bottle</option>
                                        <option value="can">Can</option>
                                        <option value="ea">Each</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateCustom}
                                    disabled={!newItem.name || !newItem.sku}
                                    className="flex-1 py-3 rounded-xl bg-[#2a2b2d] font-bold text-white shadow-lg disabled:opacity-50 hover:bg-gray-800"
                                >
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </motion.div>
        </div>
    );
}
