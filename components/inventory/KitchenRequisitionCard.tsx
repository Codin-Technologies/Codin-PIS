'use client';

import { 
    CheckCircle, 
    Loader2, 
    Utensils, 
    AlertTriangle, 
    ChevronDown, 
    ChevronUp, 
    ClipboardList,
    Clock
} from 'lucide-react';
import { useBranch } from '@/hooks/useBranch';
import { useDeductProductionInventory } from '@/hooks/useKitchen';
import { useInventory } from '@/hooks/useInventory';
import { type ProductionPlan } from '@/lib/api';
import clsx from 'clsx';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

interface KitchenRequisitionCardProps {
    plan: ProductionPlan;
    mode?: 'pending' | 'history';
    approvedAt?: number; // timestamp when it was approved (for history mode)
}

export function KitchenRequisitionCard({ plan, mode = 'pending', approvedAt }: KitchenRequisitionCardProps) {
    const { branchId } = useBranch();
    const { data: inventoryData } = useInventory(branchId);
    const deductMutation = useDeductProductionInventory(branchId);
    const [isExpanded, setIsExpanded] = useState(false);
    const [issueQtys, setIssueQtys] = useState<Record<string, number>>({});

    const inventoryItems = inventoryData?.data ?? [];
    const isHistory = mode === 'history';

    // How long ago was it approved (for history mode)
    const timeAgo = useMemo(() => {
        if (!approvedAt) return '';
        const diff = Date.now() - approvedAt;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        if (hours > 0) return `${hours}h ago`;
        return `${minutes}m ago`;
    }, [approvedAt]);

    const ingredientStocks = useMemo(() => {
        return plan.ingredients.map(ing => {
            const stockItem = inventoryItems.find(item => item.id === ing.inventoryItemId);
            const available = stockItem?.qty ?? 0;
            const shortfall = Math.max(0, ing.qty - available);
            return {
                ...ing,
                available,
                shortfall,
                sku: stockItem?.sku
            };
        });
    }, [plan.ingredients, inventoryItems]);

    useEffect(() => {
        if (isHistory) return;
        const initialQtys: Record<string, number> = {};
        ingredientStocks.forEach(ing => {
            initialQtys[ing.inventoryItemId] = Math.min(ing.qty, ing.available);
        });
        setIssueQtys(initialQtys);
    }, [ingredientStocks, isHistory]);

    const handleDeduct = () => {
        const payload = {
            ingredients: Object.entries(issueQtys).map(([id, qty]) => ({
                inventoryItemId: id,
                qty
            }))
        };
        deductMutation.mutate(
            { id: plan.id, payload },
            {
                onSuccess: () => {
                    // Record approval time in localStorage for 24h tracking
                    const key = 'kitchenRequisitionHistory';
                    const existing = JSON.parse(localStorage.getItem(key) || '[]');
                    existing.push({ id: plan.id, approvedAt: Date.now() });
                    localStorage.setItem(key, JSON.stringify(existing));
                    toast.success("Requisition approved and stock deducted!");
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to process requisition");
                }
            }
        );
    };

    const totalShortfalls = ingredientStocks.filter(s => s.shortfall > 0).length;

    // ── History Mode (read-only, greyed out) ──────────────────────────────────
    if (isHistory) {
        return (
            <div className="p-3 rounded-2xl border border-green-100 bg-green-50/40 opacity-75">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-600 truncate">{plan.dishName}</p>
                            <p className="text-[10px] text-gray-400">
                                {plan.targetServings} servings
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>{timeAgo}</span>
                    </div>
                </div>
                <div className="mt-2 px-2 py-1 bg-green-100/60 rounded-lg">
                    <p className="text-[9px] font-bold text-green-700 text-center uppercase tracking-wider">
                        ✓ Stock Deducted — No Further Action Required
                    </p>
                </div>
            </div>
        );
    }

    // ── Pending Mode (active, actionable) ─────────────────────────────────────
    return (
        <div className={clsx(
            "p-4 rounded-3xl border transition-all hover:shadow-md",
            totalShortfalls > 0 ? "bg-red-50/50 border-red-100" : "bg-orange-50/50 border-orange-100"
        )}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                        totalShortfalls > 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                    )}>
                        <Utensils className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{plan.dishName}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                            {plan.targetServings} servings • {plan.estimatedStartTime}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 hover:bg-white/50 rounded-full transition-colors"
                >
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
            </div>

            {totalShortfalls > 0 && !isExpanded && (
                <div className="mb-3 px-3 py-1.5 bg-red-100/50 rounded-xl flex items-center gap-2 border border-red-100">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    <span className="text-[10px] font-bold text-red-700">{totalShortfalls} components have stock shortages</span>
                </div>
            )}

            {isExpanded && (
                <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-top-1">
                    <div className="grid grid-cols-1 gap-2">
                        {ingredientStocks.map((ing, idx) => (
                            <div key={idx} className="bg-white/60 p-3 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">{ing.name}</p>
                                        <p className="text-[10px] text-gray-400">{ing.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Available</p>
                                        <p className={clsx(
                                            "text-xs font-black",
                                            ing.available === 0 ? "text-red-600" : "text-gray-900"
                                        )}>
                                            {ing.available} {ing.unit}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Issue Qty</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                max={ing.available}
                                                min={0}
                                                className="w-full h-8 px-2 rounded-lg border border-gray-100 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                value={issueQtys[ing.inventoryItemId] ?? 0}
                                                onChange={(e) => setIssueQtys({
                                                    ...issueQtys,
                                                    [ing.inventoryItemId]: parseFloat(e.target.value) || 0
                                                })}
                                            />
                                            <span className="text-[10px] font-bold text-gray-400">/ {ing.qty}</span>
                                        </div>
                                    </div>
                                    
                                    {ing.available === 0 && (
                                        <div className="flex flex-col gap-1">
                                            <Link 
                                                href="/procurement/new" 
                                                className="h-8 px-2 rounded-lg bg-blue-50 text-[9px] font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-100 transition-colors"
                                            >
                                                <ClipboardList className="h-3 w-3" />
                                                Procure
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {ing.shortfall > 0 && (
                                    <p className="mt-2 text-[9px] text-red-500 font-bold flex items-center gap-1">
                                        <AlertTriangle className="h-2.5 w-2.5" />
                                        Shortfall: {ing.shortfall} {ing.unit}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    disabled={deductMutation.isPending}
                    onClick={handleDeduct}
                    className={clsx(
                        "flex-1 py-2 rounded-xl text-[11px] font-black shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50",
                        totalShortfalls > 0 
                            ? "bg-[#2a2b2d] text-white hover:bg-gray-800" 
                            : "bg-orange-600 text-white hover:bg-orange-700"
                    )}
                >
                    {deductMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    {totalShortfalls > 0 ? "Partial Approval & Issue" : "Approve & Deduct All"}
                </button>
            </div>
            
            {deductMutation.isError && (
                <p className="text-[10px] text-red-600 mt-2 font-bold text-center bg-red-100/50 py-1 rounded-lg border border-red-100">
                    {(deductMutation.error as Error).message}
                </p>
            )}
        </div>
    );
}
