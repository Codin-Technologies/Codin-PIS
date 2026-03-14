'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Save, Utensils, Package, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface Ingredient {
    id: string;
    name: string;
    qty: number;
    unit: string;
    inventoryId: string;
}

interface NewProductionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (plan: any) => void;
}

// Mock inventory for ingredient selection
const MOCK_INVENTORY_ITEMS = [
    { id: 'MEA-002', name: 'Beef Short Ribs', unit: 'kg' },
    { id: 'BEV-005', name: 'Red Wine', unit: 'btl' },
    { id: 'VEG-003', name: 'Carrots', unit: 'kg' },
    { id: 'GRN-003', name: 'Arborio Rice', unit: 'kg' },
    { id: 'VEG-008', name: 'Mixed Mushrooms', unit: 'kg' },
    { id: 'DAI-001', name: 'Parmesan', unit: 'kg' },
    { id: 'SEA-001', name: 'Sea Bass Fillets', unit: 'pcs' },
    { id: 'VEG-012', name: 'Lemon', unit: 'pcs' },
];

export function NewProductionModal({ isOpen, onClose, onAdd }: NewProductionModalProps) {
    const [dish, setDish] = useState('');
    const [servings, setServings] = useState(10);
    const [startTime, setStartTime] = useState('10:00 AM');
    const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredInventory = MOCK_INVENTORY_ITEMS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedIngredients.some(si => si.inventoryId === item.id)
    );

    const addIngredient = (item: typeof MOCK_INVENTORY_ITEMS[0]) => {
        setSelectedIngredients([
            ...selectedIngredients,
            { id: Math.random().toString(36).substr(2, 9), name: item.name, qty: 1, unit: item.unit, inventoryId: item.id }
        ]);
        setSearchQuery('');
        setIsSearching(false);
    };

    const removeIngredient = (id: string) => {
        setSelectedIngredients(selectedIngredients.filter(i => i.id !== id));
    };

    const updateIngredientQty = (id: string, qty: number) => {
        setSelectedIngredients(selectedIngredients.map(i => i.id === id ? { ...i, qty } : i));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!dish || selectedIngredients.length === 0) {
            alert('Please specify what to cook and at least one ingredient.');
            return;
        }

        onAdd({
            id: `PC-${Date.now()}`,
            dish,
            servings,
            status: 'Planned',
            startTime,
            ingredients: selectedIngredients
        });

        // Reset
        setDish('');
        setServings(10);
        setStartTime('10:00 AM');
        setSelectedIngredients([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 text-pink-600">Plan Production Run</h2>
                            <p className="text-sm text-gray-500">Define what to cook and the components to use</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                        <div className="p-8 space-y-8">
                            {/* Section 1: What to Cook */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Utensils className="h-4 w-4" />
                                    Production Target
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-full space-y-1">
                                        <label className="text-xs font-bold text-gray-700">Dish Name *</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                            placeholder="e.g. Herb Roasted Chicken"
                                            value={dish}
                                            onChange={(e) => setDish(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700">Target Servings</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                            value={servings}
                                            onChange={(e) => setServings(parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700">Estimated Start Time</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Components/Ingredients */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Components (Ingredients)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsSearching(true)}
                                        className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add Component
                                    </button>
                                </div>

                                {isSearching && (
                                    <div className="relative mb-4 animate-in fade-in slide-in-from-top-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search inventory..."
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-pink-200 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                                                {filteredInventory.map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => addIngredient(item)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-pink-50 flex items-center justify-between"
                                                    >
                                                        <span>{item.name}</span>
                                                        <span className="text-[10px] text-gray-400">{item.unit}</span>
                                                    </button>
                                                ))}
                                                {filteredInventory.length === 0 && (
                                                    <div className="px-4 py-2 text-sm text-gray-400 italic">No matching items</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {selectedIngredients.map((ing) => (
                                        <div key={ing.id} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900">{ing.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase">Inventory ID: {ing.inventoryId}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:ring-1 focus:ring-pink-500"
                                                    value={ing.qty}
                                                    onChange={(e) => updateIngredientQty(ing.id, parseFloat(e.target.value))}
                                                />
                                                <span className="text-xs text-gray-500 w-8">{ing.unit}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeIngredient(ing.id)}
                                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedIngredients.length === 0 && !isSearching && (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                                            <p className="text-sm text-gray-400">No components added yet</p>
                                            <button
                                                type="button"
                                                onClick={() => setIsSearching(true)}
                                                className="mt-2 text-xs font-bold text-pink-600"
                                            >
                                                Add From Inventory
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                            <div className="text-[10px] text-gray-400 max-w-[200px]">
                                Ingredients will be deducted from inventory once production is marked as "Completed".
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#2a2b2d] text-white text-sm font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Add to Plan
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
