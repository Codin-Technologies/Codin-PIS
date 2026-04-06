import { useMemo, useState } from 'react';
import {
    BadgeDollarSign, PieChart, TrendingUp, AlertCircle,
    Plus, Edit2, Trash2, X, CheckCircle, ChevronDown,
    Utensils, HardHat, Zap, Briefcase, Layers, BarChart2,
    DollarSign, Search, Info, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranch } from '@/hooks/useBranch';
import { useCurrency } from '@/hooks/useCurrency';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets';
import { useDepartments } from '@/hooks/useDepartments';
import type { BudgetRow as Budget } from '@/lib/api';
import { ErrorState } from '@/components/ui/error-state';

// ─── Types ───────────────────────────────────────────────────────────────────

type BudgetCategory = 'Kitchen' | 'Maintenance' | 'Operations' | 'Administration' | 'Other';
type BudgetStatus = 'On Track' | 'Warning' | 'Critical';

/* 
interface Budget {
    id: string;
    name: string;
    category: BudgetCategory;
    fiscalYear: string;
    allocated: number;
    notes?: string;
} 
*/

interface MockPurchaseOrder {
    id: string;
    category: BudgetCategory;
    amount: number;
    status: 'Open' | 'Acknowledged' | 'Overdue' | 'Received' | 'Draft';
}

// ─── Initial Mock Data — REMOVED ──────────────────────────────────────────────
const MOCK_PURCHASE_ORDERS: any[] = [];
const INITIAL_BUDGETS: any[] = [];

const CATEGORY_ICONS: Record<BudgetCategory, React.ElementType> = {
    Kitchen: Utensils,
    Maintenance: HardHat,
    Operations: Zap,
    Administration: Briefcase,
    Other: Layers,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
    Kitchen:        { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-500' },
    Maintenance:    { bg: 'bg-blue-100',   text: 'text-blue-600',   bar: 'bg-blue-500' },
    Operations:     { bg: 'bg-emerald-100',text: 'text-emerald-600',bar: 'bg-emerald-500' },
    Administration: { bg: 'bg-violet-100', text: 'text-violet-600', bar: 'bg-violet-500' },
    Other:          { bg: 'bg-gray-100',   text: 'text-gray-600',   bar: 'bg-gray-500' },
};

const CATEGORIES: BudgetCategory[] = ['Kitchen', 'Maintenance', 'Operations', 'Administration', 'Other'];
const FISCAL_YEARS = ['2024', '2025', '2026', '2027'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryMapping(deptName: string | null): BudgetCategory {
    if (!deptName) return 'Other';
    const lower = deptName.toLowerCase();
    if (lower.includes('kitchen')) return 'Kitchen';
    if (lower.includes('maintenance')) return 'Maintenance';
    if (lower.includes('operations')) return 'Operations';
    if (lower.includes('admin')) return 'Administration';
    return 'Other';
}

// ─── Empty Form State ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
    name: '',
    departmentId: '',
    fiscalYear: '2026',
    amount: '',
    notes: '',
};

// ─── Add/Edit Slide Panel ──────────────────────────────────────────────────────

function BudgetFormPanel({
    mode,
    initial,
    onSave,
    onClose,
    isSaving,
    departments = []
}: {
    mode: 'add' | 'edit';
    initial: typeof EMPTY_FORM;
    onSave: (data: typeof EMPTY_FORM) => void;
    onClose: () => void;
    isSaving: boolean;
    departments?: any[];
}) {
    const { format: fmt, symbol } = useCurrency();
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate() {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Budget name is required';
        if (!form.departmentId) e.departmentId = 'Department is required';
        if (!form.amount || Number(form.amount) <= 0) e.amount = 'Amount must be > 0';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSubmit() {
        if (!validate()) return;
        onSave(form);
    }

    const selectedDept = departments.find(d => d.id === form.departmentId);
    const category = getCategoryMapping(selectedDept?.name);
    const CategoryIcon = CATEGORY_ICONS[category];
    const catColor = CATEGORY_COLORS[category];

    const amountNum = Number(form.amount) || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="h-full w-full max-w-xl bg-[#f8f9fc] shadow-2xl overflow-y-auto flex flex-col"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-7 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {mode === 'add' ? 'New Budget' : 'Edit Budget'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {mode === 'add' ? 'Define a new procurement budget' : 'Update budget details'}
                        </p>
                    </div>
                    <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 p-7 space-y-6">
                    {/* Live Preview Card */}
                    <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={clsx('h-9 w-9 rounded-xl flex items-center justify-center', catColor.bg, catColor.text)}>
                                <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{form.name || 'Budget Name'}</p>
                                <p className="text-xs text-gray-400">{selectedDept?.name || 'Department'} • FY{form.fiscalYear}</p>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className={clsx('h-full rounded-full transition-all duration-500', catColor.bar)} style={{ width: `0%` }} />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium">
                            <span>Pending Initialization</span>
                            <span>Total: {fmt(amountNum)}</span>
                        </div>
                        <p className="mt-2 text-[9px] text-gray-400 font-medium leading-tight">
                            * Budget tracking will begin once this budget is saved.
                        </p>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Budget Settings</h3>

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Budget Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Kitchen & F&B Q2"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className={clsx(
                                    'w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition-all',
                                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                )}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Category + Fiscal Year */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Department *</label>
                                <div className="relative">
                                    <select
                                        value={form.departmentId}
                                        onChange={e => setForm({ ...form, departmentId: e.target.value })}
                                        className={clsx(
                                            'w-full appearance-none border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white pr-8',
                                            errors.departmentId ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                        )}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                                {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Fiscal Year *</label>
                                <div className="relative">
                                    <select
                                        value={form.fiscalYear}
                                        onChange={e => setForm({ ...form, fiscalYear: e.target.value })}
                                        className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white pr-8"
                                    >
                                        {FISCAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Budget Amount *</label>
                            <div className="relative">
                                <div className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 font-bold flex items-center justify-center text-[10px]">
                                    {symbol}
                                </div>
                                <input
                                    type="number"
                                    placeholder="0"
                                    min={0}
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                    className={clsx(
                                        'w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition-all',
                                        errors.amount ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                    )}
                                />
                            </div>
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                        </div>

                        {/* Summary Info */}
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-gray-500 leading-normal">
                                Spent and Committed values will be automatically updated as Purchase Orders are created and received in the <span className="font-bold">{selectedDept?.name || 'selected'}</span> department.
                            </p>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notes</label>
                            <textarea
                                rows={3}
                                placeholder="Optional notes about this budget..."
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-7 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="flex-1 py-2.5 rounded-xl bg-[#2a2b2d] text-white text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        {mode === 'add' ? 'Create Budget' : 'Save Changes'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({ budget, onConfirm, onClose, isDeleting }: { budget: Budget; onConfirm: () => void; onClose: () => void; isDeleting: boolean }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
                <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center mb-5">
                    <Trash2 className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Budget</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete <span className="font-bold text-gray-800">"{budget.name}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isDeleting}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Delete Budget
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Budget Card ──────────────────────────────────────────────────────────────

function BudgetCard({ budget, onEdit, onDelete }: { budget: Budget; onEdit: () => void; onDelete: () => void }) {
    const { format: fmt } = useCurrency();
    const category = getCategoryMapping(budget.departmentName);
    const StatusIcon = CATEGORY_ICONS[category];
    const colors = CATEGORY_COLORS[category];
    
    // Derive spending stats directly from API
    const { spent, committed, health: status, remaining } = budget;
    const allocatedNum = Number(budget.allocatedAmount) || 0;
    const totalUsed = spent + committed;
    const pct = allocatedNum > 0 ? totalUsed / allocatedNum : 0;

    const spentPct = allocatedNum > 0 ? Math.min(100, (spent / allocatedNum) * 100) : 0;
    const committedPct = allocatedNum > 0 ? Math.min(100 - spentPct, (committed / allocatedNum) * 100) : 0;
    const totalUsedPct = Math.round(pct * 100);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className={clsx('h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm', colors.bg, colors.text)}>
                        <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{budget.name}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">{budget.departmentName || 'No Dept'} • FY{budget.fiscalYear}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                        status === 'on_track' ? 'bg-emerald-50 text-emerald-700' :
                        status === 'warning'  ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                    )}>
                        {status.replace('_', ' ')}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                            <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={onDelete} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Allocated */}
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-bold text-gray-400 uppercase">Budget Progress</span>
                    <span className="text-xs font-black text-gray-700">{totalUsedPct}% used</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div className={clsx('h-full transition-all duration-700', colors.bar)} style={{ width: `${spentPct}%` }} />
                    <div className="h-full bg-gray-300 opacity-60 transition-all duration-700" style={{ width: `${committedPct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                        <span className={clsx('inline-block h-2 w-2 rounded-full', colors.bar)} />
                        Spent {fmt(spent)}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
                        Committed {fmt(committed)}
                    </span>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
                <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Allocated</p>
                    <p className="text-sm font-black text-gray-900">{fmt(allocatedNum)}</p>
                </div>
                <div className="text-center border-x border-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Remaining</p>
                    <p className={clsx('text-sm font-black', remaining < 0 ? 'text-red-600' : 'text-emerald-600')}>
                        {fmt(Math.abs(remaining))}
                        {remaining < 0 && <span className="text-[9px] ml-0.5">over</span>}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Available</p>
                    <p className={clsx('text-sm font-black', remaining > 0 ? 'text-gray-900' : 'text-red-600')}>
                        {remaining > 0 ? fmt(remaining) : fmt(0)}
                    </p>
                </div>
            </div>

            {budget.notes && (
                <p className="mt-3 pt-3 border-t border-gray-50 text-[11px] text-gray-400 italic line-clamp-1">{budget.notes}</p>
            )}
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BudgetView() {
    const { branchId } = useBranch();
    const { format: fmt } = useCurrency();
    const [panelMode, setPanelMode] = useState<'add' | 'edit' | null>(null);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const [filterYear, setFilterYear] = useState('All');

    // ── Queries and Mutations ──────────────────────────────────────────────────
    const { data: budgetsRes, isLoading, error } = useBudgets(branchId, {
        fiscalYear: filterYear !== 'All' ? filterYear : undefined,
        departmentId: filterDept !== 'All' ? filterDept : undefined,
    });
    const { data: departments } = useDepartments(branchId);
    
    const createBudgetMutation = useCreateBudget(branchId);
    const updateBudgetMutation = useUpdateBudget(branchId);
    const deleteBudgetMutation = useDeleteBudget(branchId);

    const budgets = budgetsRes || [];

    // ── Derived Aggregate Stats ────────────────────────────────────────────────
    const overallStats = useMemo(() => {
        let allocated = 0;
        let spent = 0;
        let committed = 0;

        budgets.forEach(b => {
             allocated += Number(b.allocatedAmount) || 0;
             spent += b.spent;
             committed += b.committed;
        });

        return { allocated, spent, committed, remaining: allocated - (spent + committed) };
    }, [budgets]);

    const overBudgetCount = budgets.filter(b => b.health === 'critical').length;
    const spendPct = overallStats.allocated > 0 ? Math.round((overallStats.spent / overallStats.allocated) * 100) : 0;

    const filtered = useMemo(() => budgets.filter(b => {
        const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
            (b.departmentName || '').toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    }), [budgets, search]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    function openAdd() {
        setEditingBudget(null);
        setPanelMode('add');
    }

    function openEdit(b: Budget) {
        setEditingBudget(b);
        setPanelMode('edit');
    }

    async function handleSave(form: typeof EMPTY_FORM) {
        try {
            if (panelMode === 'add') {
                await createBudgetMutation.mutateAsync({
                    name: form.name,
                    departmentId: form.departmentId,
                    fiscalYear: form.fiscalYear,
                    amount: Number(form.amount),
                    notes: form.notes || null,
                    branchId,
                });
            } else if (editingBudget) {
                await updateBudgetMutation.mutateAsync({
                    id: editingBudget.id,
                    payload: {
                        name: form.name,
                        departmentId: form.departmentId,
                        fiscalYear: form.fiscalYear,
                        amount: Number(form.amount),
                        notes: form.notes || null,
                    }
                });
            }
            setPanelMode(null);
            setEditingBudget(null);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleDelete() {
        if (!deletingBudget) return;
        try {
            await deleteBudgetMutation.mutateAsync(deletingBudget.id);
            setDeletingBudget(null);
        } catch (e) {
            console.error(e);
        }
    }

    const formInitial = editingBudget ? {
        name: editingBudget.name,
        departmentId: editingBudget.departmentId,
        fiscalYear: editingBudget.fiscalYear,
        amount: String(editingBudget.allocatedAmount),
        notes: editingBudget.notes || '',
    } : EMPTY_FORM;

    if (error) return <ErrorState message={(error as Error).message} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Automated tracking from Purchase Orders</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#2a2b2d] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    New Budget
                </button>
            </div>

            {/* ── KPI Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total Allocated',
                        value: fmt(overallStats.allocated),
                        sub: `${budgets.length} Category Budgets`,
                        icon: BadgeDollarSign,
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-50',
                    },
                    {
                        label: 'Auto-Tracked Spent',
                        value: fmt(overallStats.spent),
                        sub: `${spendPct}% of total spent`,
                        icon: TrendingUp,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                    },
                    {
                        label: 'Total Remaining',
                        value: fmt(Math.max(0, overallStats.remaining)),
                        sub: `${fmt(overallStats.committed)} committed`,
                        icon: PieChart,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                    },
                    {
                        label: 'Budget Warnings',
                        value: String(overBudgetCount),
                        sub: overBudgetCount === 0 ? 'Optimal utilization' : `${overBudgetCount} budgets at risk`,
                        icon: AlertCircle,
                        color: overBudgetCount > 0 ? 'text-red-600' : 'text-gray-500',
                        bg: overBudgetCount > 0 ? 'bg-red-50' : 'bg-gray-50',
                    },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 mt-0.5 leading-tight">{stat.value}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
                        </div>
                        <div className={clsx('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0', stat.bg, stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Overall Progress Bar ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-bold text-gray-700">Combined Spending vs Allocation</span>
                    </div>
                    <span className="text-sm font-black text-gray-900">{fmt(overallStats.spent + overallStats.committed)} / {fmt(overallStats.allocated)}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex gap-px">
                    {budgets.map((b) => {
                        const pct = overallStats.allocated > 0 ? (b.spent / overallStats.allocated) * 100 : 0;
                        const category = getCategoryMapping(b.departmentName);
                        return (
                            <div
                                key={b.id}
                                title={`${b.name}: ${fmt(b.spent)}`}
                                className={clsx('h-full transition-all duration-700', CATEGORY_COLORS[category].bar)}
                                style={{ width: `${pct}%` }}
                            />
                        );
                    })}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                    {['Kitchen', 'Maintenance', 'Operations', 'Administration', 'Other'].map(c => (
                        <div key={c} className="flex items-center gap-1.5">
                            <span className={clsx('h-2.5 w-2.5 rounded-full', CATEGORY_COLORS[c].bar)} />
                            <span className="text-[11px] text-gray-500">{c}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Filters ───────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search budgets..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterDept}
                        onChange={e => setFilterDept(e.target.value)}
                        className="appearance-none border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm bg-white focus:outline-none"
                    >
                        <option value="All">All Departments</option>
                        {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <div className="relative">
                    <select
                        value={filterYear}
                        onChange={e => setFilterYear(e.target.value)}
                        className="appearance-none border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm bg-white focus:outline-none"
                    >
                        <option value="All">All Years</option>
                        {FISCAL_YEARS.map(y => <option key={y} value={y}>FY {y}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {(search || filterDept !== 'All' || filterYear !== 'All') && (
                    <button
                        onClick={() => { setSearch(''); setFilterDept('All'); setFilterYear('All'); }}
                        className="text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* ── Budget Cards Grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        </div>
                    ) : filtered.map(budget => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            onEdit={() => openEdit(budget)}
                            onDelete={() => setDeletingBudget(budget)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <BadgeDollarSign className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-gray-500">No budgets found</h3>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting filters or create a new budget.</p>
                    <button onClick={openAdd} className="mt-4 px-5 py-2 bg-[#2a2b2d] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                        Add First Budget
                    </button>
                </div>
            )}

            {/* ── Panels & Modals ───────────────────────────────────────── */}
            <AnimatePresence>
                {panelMode && (
                    <BudgetFormPanel
                        key="form-panel"
                        mode={panelMode}
                        initial={formInitial}
                        onSave={handleSave}
                        onClose={() => { setPanelMode(null); setEditingBudget(null); }}
                        isSaving={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                        departments={departments}
                    />
                )}
                {deletingBudget && (
                    <DeleteModal
                        key="delete-modal"
                        budget={deletingBudget}
                        onConfirm={handleDelete}
                        onClose={() => setDeletingBudget(null)}
                        isDeleting={deleteBudgetMutation.isPending}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
