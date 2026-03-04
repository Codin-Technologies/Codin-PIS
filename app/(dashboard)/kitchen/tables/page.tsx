'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, RotateCcw, Save } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

type TableShape = 'round' | 'square' | 'rectangle';
type TableStatus = 'available' | 'occupied' | 'reserved';

interface Table {
    id: string;
    label: string;
    shape: TableShape;
    x: number;
    y: number;
    seats: number;
    status: TableStatus;
}

const INITIAL_TABLES: Table[] = [
    { id: 't1', label: '1', shape: 'round', x: 100, y: 100, seats: 4, status: 'occupied' },
    { id: 't2', label: '2', shape: 'square', x: 300, y: 100, seats: 2, status: 'available' },
    { id: 't3', label: '3', shape: 'rectangle', x: 100, y: 300, seats: 6, status: 'reserved' },
];

export default function TableManagementPage() {
    const router = useRouter();
    const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleAddTable = (shape: TableShape) => {
        const newTable: Table = {
            id: `t${Date.now()}`,
            label: `${tables.length + 1}`,
            shape,
            x: 50,
            y: 50,
            seats: shape === 'rectangle' ? 6 : shape === 'round' ? 4 : 2,
            status: 'available',
        };
        setTables([...tables, newTable]);
        setSelectedTableId(newTable.id);
    };

    const handleUpdateTable = (id: string, updates: Partial<Table>) => {
        setTables(tables.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const handleDeleteTable = (id: string) => {
        setTables(tables.filter(t => t.id !== id));
        if (selectedTableId === id) setSelectedTableId(null);
    };

    const handleDragEnd = (id: string, info: any) => {
        // In a real app, calculate new X/Y relative to container
        // For this demo, we're relying on Framer Motion's visual persistence 
        // but to save state we'd need to update x/y based on delta

        // This is a simplified persistence for the demo
        const table = tables.find(t => t.id === id);
        if (table) {
            handleUpdateTable(id, {
                x: table.x + info.offset.x,
                y: table.y + info.offset.y
            });
        }
    };

    const selectedTable = tables.find(t => t.id === selectedTableId);

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            {/* Sidebar Controls */}
            <div className="w-80 flex flex-col gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full overflow-y-auto">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Floor Plan</h1>
                </div>

                {/* Add Tables */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase">Add Table</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleAddTable('round')}
                            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <div className="w-8 h-8 rounded-full border-2 border-gray-400 mb-2"></div>
                            <span className="text-xs font-medium text-gray-600">Round</span>
                        </button>
                        <button
                            onClick={() => handleAddTable('square')}
                            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <div className="w-8 h-8 border-2 border-gray-400 mb-2"></div>
                            <span className="text-xs font-medium text-gray-600">Square</span>
                        </button>
                        <button
                            onClick={() => handleAddTable('rectangle')}
                            className="col-span-2 flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <div className="w-16 h-8 border-2 border-gray-400 mb-2"></div>
                            <span className="text-xs font-medium text-gray-600">Rectangle</span>
                        </button>
                    </div>
                </div>

                {/* Properties Panel */}
                {selectedTable ? (
                    <div className="space-y-4 pt-4 border-t border-gray-100 animate-in slide-in-from-left">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">Table Settings</h3>
                            <span className="text-xs text-gray-400">ID: {selectedTable.label}</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Label</label>
                                <input
                                    type="text"
                                    value={selectedTable.label}
                                    onChange={(e) => handleUpdateTable(selectedTable.id, { label: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Seats</label>
                                <input
                                    type="number"
                                    value={selectedTable.seats}
                                    onChange={(e) => handleUpdateTable(selectedTable.id, { seats: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                                <select
                                    value={selectedTable.status}
                                    onChange={(e) => handleUpdateTable(selectedTable.id, { status: e.target.value as TableStatus })}
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                                >
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="reserved">Reserved</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                onClick={() => handleDeleteTable(selectedTable.id)}
                                className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-400 text-sm">
                        Select a table to edit properties
                    </div>
                )}

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#2a2b2d] text-white rounded-xl font-bold shadow-lg hover:bg-gray-800">
                        <Save className="h-4 w-4" />
                        Save Layout
                    </button>
                </div>
            </div>

            {/* Floor Plan Canvas */}
            <div
                ref={containerRef}
                className="flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 relative overflow-hidden shadow-inner"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            >
                {tables.map(table => (
                    <motion.div
                        key={table.id}
                        drag
                        dragMomentum={false}
                        dragConstraints={containerRef}
                        onDragEnd={(e, info) => handleDragEnd(table.id, info)}
                        onClick={() => setSelectedTableId(table.id)}
                        initial={{ x: table.x, y: table.y, scale: 0 }}
                        animate={{
                            x: table.x,
                            y: table.y,
                            scale: 1,
                            boxShadow: selectedTableId === table.id ? '0 0 0 2px #3b82f6, 0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                        className={clsx(
                            "absolute flex items-center justify-center cursor-move transition-colors font-bold text-gray-700 select-none",
                            table.shape === 'round' && "rounded-full",
                            table.shape === 'square' && "rounded-2xl",
                            table.shape === 'rectangle' && "rounded-xl",
                            table.status === 'available' && "bg-white border-2 border-gray-200",
                            table.status === 'occupied' && "bg-red-50 border-2 border-red-200 text-red-700",
                            table.status === 'reserved' && "bg-orange-50 border-2 border-orange-200 text-orange-700",
                            selectedTableId === table.id && "z-10 ring-2 ring-blue-500 ring-offset-2"
                        )}
                        style={{
                            width: table.shape === 'rectangle' ? 160 : 80,
                            height: table.shape === 'rectangle' ? 80 : 80,
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <span>{table.label}</span>
                            <span className="text-[10px] font-normal opacity-60">{table.seats} seats</span>
                        </div>

                        {/* Visual Chairs (Decoration) */}
                        {table.shape === 'round' && (
                            <>
                                <div className="absolute -top-3 w-8 h-2 bg-gray-300 rounded-full" />
                                <div className="absolute -bottom-3 w-8 h-2 bg-gray-300 rounded-full" />
                                <div className="absolute -left-3 h-8 w-2 bg-gray-300 rounded-full" />
                                <div className="absolute -right-3 h-8 w-2 bg-gray-300 rounded-full" />
                            </>
                        )}
                    </motion.div>
                ))}

                {tables.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                        <Plus className="h-12 w-12 mb-2 opacity-20" />
                        <p>Drag tables here or use the sidebar to add new ones</p>
                    </div>
                )}
            </div>
        </div>
    );
}
