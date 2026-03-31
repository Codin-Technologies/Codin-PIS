'use client';

import { CheckCircle2, Circle, Clock, Users, ChevronDown, ChevronUp, Loader2, PackageCheck, PackageOpen } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useBranch } from '@/hooks/useBranch';
import { useUpdateProductionPlanStatus } from '@/hooks/useKitchen';
import { type ProductionPlan } from '@/lib/api';

interface CookingPlanCardProps extends ProductionPlan {}

export function CookingPlanCard({ id, dishName, targetServings, status, estimatedStartTime, ingredients, inventoryStatus }: CookingPlanCardProps) {
    const { branchId } = useBranch();
    const [isExpanded, setIsExpanded] = useState(false);
    const updateStatusMutation = useUpdateProductionPlanStatus(branchId);

    const statusColors = {
        'Planned': 'bg-gray-100 text-gray-700 border-gray-200',
        'In Prep': 'bg-blue-100 text-blue-700 border-blue-200',
        'Cooked': 'bg-orange-100 text-orange-700 border-orange-200',
        'Completed': 'bg-green-100 text-green-700 border-green-200',
        'Cancelled': 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-5 flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{dishName}</h3>
                        <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[status])}>
                            {status}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {targetServings} Servings
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Start: {estimatedStartTime}
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
                        {ingredients.map((ing, idx) => (
                            <div key={ing.inventoryItemId || idx} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                                <span className="text-sm text-gray-700">{ing.name || 'Component'}</span>
                                <span className="text-sm font-medium text-gray-900">{ing.qty} {ing.unit || 'units'}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {status !== 'Completed' ? (
                            <>
                                <div className={clsx(
                                    "flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border shadow-sm",
                                    inventoryStatus === 'Deducted' 
                                        ? "bg-green-50 text-green-700 border-green-100" 
                                        : "bg-orange-50 text-orange-700 border-orange-100"
                                )}>
                                    {inventoryStatus === 'Deducted' ? <PackageCheck className="h-3.5 w-3.5" /> : <PackageOpen className="h-3.5 w-3.5" />}
                                    Stock {inventoryStatus === 'Deducted' ? 'Deducted' : 'Pending Approval'}
                                </div>
                                <button
                                    disabled={updateStatusMutation.isPending}
                                    onClick={() => updateStatusMutation.mutate({ 
                                        id, 
                                        status: status === 'Planned' ? 'In Prep' : (status as any) === 'In Prep' ? 'Completed' : 'Completed' 
                                    })}
                                    className="px-4 py-2 bg-[#2a2b2d] text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    {updateStatusMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                                    Move to {status === 'Planned' ? 'Prep' : 'Complete'}
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
