'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { X, Shield, Check, Lock } from 'lucide-react';
import clsx from 'clsx';

interface PermissionRow {
    module: string;
    feature: string;
    permissions: {
        access: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

const MODULES: { name: string; features: string[] }[] = [
    { name: 'Dashboard', features: ['Analytics View', 'Activity Feed'] },
    { name: 'Inventory', features: ['SKU Catalog', 'Stock Inventory', 'Warehouse Management'] },
    { name: 'Procurement', features: ['Requisitions', 'RFQs', 'Purchase Orders', 'Suppliers'] },
    { name: 'Kitchen', features: ['Recipe Management', 'Daily Stock Usage', 'Production Planning'] },
    { name: 'Reports', features: ['Financial Reports', 'Operational Analytics', 'Inventory Valuations'] },
    { name: 'System', features: ['Users', 'Roles', 'Organizations / Branches'] },
];

interface CreateRoleFormProps {
    onClose: () => void;
    onSuccess: (newRole: any) => void;
}

export function CreateRoleForm({ onClose, onSuccess }: CreateRoleFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [permissions, setPermissions] = useState<Record<string, PermissionRow['permissions']>>(() => {
        const initial: Record<string, PermissionRow['permissions']> = {};
        MODULES.forEach(m => {
            m.features.forEach(f => {
                initial[f] = { access: false, create: false, update: false, delete: false };
            });
        });
        return initial;
    });

    const togglePermission = (feature: string, type: keyof PermissionRow['permissions']) => {
        setPermissions(prev => ({
            ...prev,
            [feature]: {
                ...prev[feature],
                [type]: !prev[feature][type]
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const activePermissionsCount = Object.values(permissions).reduce((acc, curr) => {
            return acc + Object.values(curr).filter(Boolean).length;
        }, 0);

        const newRole = {
            id: Math.random(),
            name: formData.get('name'),
            permissions: `${activePermissionsCount} Permissions Active`,
            users: 0,
        };

        onSuccess(newRole);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-8 h-full max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Create New System Role</h2>
                        <p className="text-gray-500 text-sm">Define granular permissions for platform access.</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 overflow-hidden">
                <div className="overflow-y-auto pr-2 flex flex-col gap-8 scrollbar-thin">
                    <FieldGroup className="grid grid-cols-1 gap-6">
                        <Field>
                            <FieldLabel htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-gray-400">Role Name</FieldLabel>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Senior Procurement Officer"
                                required
                                className="h-12 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 rounded-xl"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="description" className="text-xs uppercase tracking-widest font-bold text-gray-400">Description</FieldLabel>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Briefly describe what this role is for..."
                                className="h-12 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 rounded-xl"
                            />
                        </Field>
                    </FieldGroup>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400">Permission Matrix</h3>
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-50 bg-gray-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Module / Feature</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Access</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Create</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Update</th>
                                        <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MODULES.map((module) => (
                                        <div key={module.name} className="contents">
                                            <tr className="bg-gray-50/30">
                                                <td colSpan={5} className="px-6 py-2 text-[10px] font-bold text-pink-500 uppercase tracking-widest leading-none bg-pink-50/20">{module.name}</td>
                                            </tr>
                                            {module.features.map((feature) => (
                                                <tr key={feature} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-gray-900">{feature}</div>
                                                    </td>
                                                    {(['access', 'create', 'update', 'delete'] as const).map((type) => (
                                                        <td key={type} className="px-4 py-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePermission(feature, type)}
                                                                className={clsx(
                                                                    "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center mx-auto",
                                                                    permissions[feature][type]
                                                                        ? "bg-pink-500 border-pink-500 text-white shadow-sm"
                                                                        : "border-gray-200 hover:border-pink-300"
                                                                )}
                                                            >
                                                                {permissions[feature][type] && <Check className="w-4 h-4 stroke-[3px]" />}
                                                            </button>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </div>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-100 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-all font-sans"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98] font-sans"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                Creating Role...
                            </div>
                        ) : "Create Custom Role"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
