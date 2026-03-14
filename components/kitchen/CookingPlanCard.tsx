'use client';

import { CheckCircle2, Circle, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface Ingredient {
    id: string;
    name: string;
    qty: number;
    unit: string;
    inventoryId: string;
    deducted?: boolean;
}

interface CookingPlanCardProps {
    dish: string;
    servings: number;
    status: 'Planned' | 'In Prep' | 'Cooked' | 'Completed';
    startTime: string;
    ingredients: Ingredient[];
    onStatusChange: (status: any) => void;
    onIngredientsDeduct: () => void;
}

export function CookingPlanCard({ dish, servings, status, startTime, ingredients, onStatusChange, onIngredientsDeduct }: CookingPlanCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusColors = {
        'Planned': 'bg-gray-100 text-gray-700 border-gray-200',
        'In Prep': 'bg-blue-100 text-blue-700 border-blue-200',
        'Cooked': 'bg-orange-100 text-orange-700 border-orange-200',
        'Completed': 'bg-green-100 text-green-700 border-green-200',
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-5 flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{dish}</h3>
                        <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[status])}>
                            {status}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {servings} Servings
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Start: {startTime}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 hover:bg-gray-50 rounded-full text-gray-400"
                >
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
            </div>

            {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-50 pt-4 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ingredient Checklist</h4>
                    <div className="space-y-2 mb-6">
                        {ingredients.map((ing) => (
                            <div key={ing.id} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                                <span className="text-sm text-gray-700">{ing.name}</span>
                                <span className="text-sm font-medium text-gray-900">{ing.qty} {ing.unit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {status !== 'Completed' ? (
                            <>
                                <button
                                    onClick={onIngredientsDeduct}
                                    className="flex-1 py-2 bg-[#2a2b2d] text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
                                >
                                    Deduct All from Stock
                                </button>
                                <button
                                    onClick={() => onStatusChange(status === 'Planned' ? 'In Prep' : status === 'In Prep' ? 'Cooked' : 'Completed')}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Move to {status === 'Planned' ? 'Prep' : status === 'In Prep' ? 'Cook' : 'Complete'}
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-green-100">
                                <CheckCircle2 className="h-4 w-4" />
                                Production Completed
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
