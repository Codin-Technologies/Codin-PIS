'use client';

import { useState } from 'react';
import { Search, X, ShoppingCart, Check, Plus, Loader2, AlertCircle, Package } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '@/hooks/useInventory';
import { useBranch } from '@/hooks/useBranch';
import { useDepartments } from '@/hooks/useDepartments';
import { Button } from '@/components/ui/button';

export function CatalogModal({ 
    isOpen, 
    onClose, 
    onAddItems 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onAddItems: (items: any[]) => void 
}) {
    const { branchId } = useBranch();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch Inventory & Departments
    const { data: inventoryData, isLoading, isError } = useInventory(branchId, {
        search: searchTerm,
        dept: selectedCategory === 'All' ? undefined : selectedCategory
    });
    const { data: departments } = useDepartments(branchId);

    const inventoryItems = inventoryData?.data || [];
    const categories = ['All', ...(departments || []).map(d => d.name)];

    // Custom Item Form State
    const [newItem, setNewItem] = useState({ name: '', sku: '', category: '', price: 0, unit: 'kg' });

    const toggleItem = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(i => i !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleAdd = () => {
        const itemsToAdd = inventoryItems.filter(item => selectedItems.includes(item.id));
        // Transform for Requisition Line Item format
        const transformedItems = itemsToAdd.map(item => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            price: item.unitCost || 0,
            unit: item.unit || 'ea',
            qty: 1, // Default qty
        }));
        onAddItems(transformedItems);
        setSelectedItems([]);
        onClose();
    };

    const handleCreateCustom = () => {
        if (!newItem.name || !newItem.sku) return;

        const customItem = {
            id: `CUSTOM-${Date.now()}`,
            ...newItem,
            qty: 1,
        };

        onAddItems([customItem]);
        setIsCreating(false);
        setNewItem({ name: '', sku: '', category: '', price: 0, unit: 'kg' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-5xl h-[85vh] bg-[#f8f9fc] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20"
            >
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{isCreating ? 'Create Custom Item' : 'Inventory Catalog'}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Select available stock to add to your requisition</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                        <X className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                {!isCreating ? (
                    <>
                        {/* Filters & Search */}
                        <div className="px-8 py-5 bg-white border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by SKU, Name, or Category..."
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 items-center overflow-x-auto pb-1 max-w-full">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={clsx(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                                            selectedCategory === cat 
                                                ? 'bg-gray-900 text-white shadow-lg scale-105' 
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Inventory Grid */}
                        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200 bg-[#f8f9fc]">
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="h-10 w-10 text-gray-300 animate-spin" />
                                    <p className="text-gray-400 font-medium font-sans">Scanning inventory...</p>
                                </div>
                            ) : isError ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">Sync Error</h3>
                                    <p className="text-gray-500">Could not retrieve stock levels. Please try again.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                    {/* Create Custom Button Card */}
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        onClick={() => setIsCreating(true)}
                                        className="group cursor-pointer rounded-3xl border-2 border-dashed border-gray-200 p-6 transition-all hover:border-gray-900/20 hover:bg-white flex flex-col items-center justify-center text-center h-full min-h-[220px]"
                                    >
                                        <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm">
                                            <Plus className="h-7 w-7 text-gray-400 group-hover:text-white" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm">Custom Item</h3>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">Not in inventory?</p>
                                    </motion.div>

                                    {inventoryItems.map(item => {
                                        const isSelected = selectedItems.includes(item.id);
                                        return (
                                            <motion.div
                                                key={item.id}
                                                whileHover={{ y: -5 }}
                                                onClick={() => toggleItem(item.id)}
                                                className={clsx(
                                                    "group cursor-pointer rounded-3xl border-2 p-5 transition-all relative h-full flex flex-col",
                                                    isSelected
                                                        ? 'bg-white border-gray-900 shadow-xl ring-4 ring-black/5'
                                                        : 'bg-white border-transparent hover:border-gray-200 hover:shadow-lg shadow-sm'
                                                )}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-4 right-4 bg-gray-900 text-white rounded-full p-1 shadow-lg">
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                )}
                                                <div className="h-16 w-16 mb-4 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform">
                                                    <Package className="h-8 w-8" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-black text-gray-900 text-sm leading-tight mb-1">{item.name}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">{item.sku}</p>
                                                    
                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Estimated</span>
                                                            <span className="font-black text-gray-900 text-sm">${(item.unitCost || 0).toFixed(2)}</span>
                                                        </div>
                                                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 font-bold">{item.unit || 'ea'}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {!isLoading && inventoryItems.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-10 bg-white rounded-[2rem] border border-gray-100 italic">
                                    <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="text-sm font-medium">No inventory items found matching your search.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="bg-white border-t border-gray-100 px-10 py-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 font-black text-xs">
                                    {selectedItems.length}
                                </span>
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest text-[10px]">Items Selected</span>
                            </div>
                            <Button
                                onClick={handleAdd}
                                disabled={selectedItems.length === 0}
                                size="lg"
                                className="rounded-2xl bg-gray-900 px-10 py-7 text-sm font-black text-white shadow-2xl disabled:opacity-30 disabled:grayscale transition-all hover:bg-gray-800 hover:scale-105 active:scale-95"
                            >
                                Add To Requisition
                            </Button>
                        </div>
                    </>
                ) : (
                    /* CUSTOM ITEM FORM */
                    <div className="flex-1 flex flex-col p-12 bg-white overflow-y-auto">
                        <div className="max-w-xl mx-auto w-full space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal SKU / Code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. NON-STOCK-001"
                                        className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-medium"
                                        value={newItem.sku}
                                        onChange={e => setNewItem({ ...newItem, sku: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. One-off Event Decor"
                                        className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-medium"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estimated Unit Price</label>
                                        <input
                                            type="number"
                                            className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-medium"
                                            value={newItem.price}
                                            onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Unit of Measure</label>
                                        <select
                                            className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-medium appearance-none"
                                            value={newItem.unit}
                                            onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="L">Litres</option>
                                            <option value="ea">Each (Units)</option>
                                            <option value="cs">Case</option>
                                            <option value="box">Box</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 h-14 rounded-2xl font-bold text-gray-400 uppercase tracking-widest text-[10px] hover:bg-gray-50"
                                >
                                    Go Back
                                </Button>
                                <Button
                                    onClick={handleCreateCustom}
                                    disabled={!newItem.name || !newItem.sku}
                                    className="flex-1 h-14 rounded-2xl bg-gray-900 font-black text-white shadow-xl hover:bg-gray-800 transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Add Custom Item
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </motion.div>
        </div>
    );
}
