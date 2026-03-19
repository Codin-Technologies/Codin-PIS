'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { X, Shield, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { usePermissions, useCreateRole } from '@/hooks/useUsers';

interface CreateRoleFormProps {
    onClose: () => void;
    onSuccess: (newRole: any) => void;
}

export function CreateRoleForm({ onClose, onSuccess }: CreateRoleFormProps) {
    const { data: groups, isLoading: isLoadingPermissions } = usePermissions();
    const createRoleMutation = useCreateRole();

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Process permissions into a matrix structure
    const matrixData = useMemo(() => {
        if (!groups) return [];

        return groups.map(group => {
            const features: Record<string, { read?: string; create?: string; update?: string; delete?: string }> = {};
            
            group.permissions.forEach(perm => {
                const [feature, action] = perm.name.split('.');
                if (!features[feature]) features[feature] = {};
                
                if (action === 'read') features[feature].read = perm.id;
                else if (action === 'create') features[feature].create = perm.id;
                else if (action === 'update') features[feature].update = perm.id;
                else if (action === 'delete') features[feature].delete = perm.id;
                else {
                    // Fallback for non-standard actions, map to 'read' if it's the only one or something
                    features[feature].read = features[feature].read || perm.id;
                }
            });

            return {
                name: group.name,
                features: Object.entries(features).map(([name, actions]) => ({
                    name,
                    actions
                }))
            };
        });
    }, [groups]);

    const togglePermission = (permId: string) => {
        setSelectedPermissions(prev => 
            prev.includes(permId) 
                ? prev.filter(id => id !== permId)
                : [...prev, permId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        
        const formData = new FormData(e.target as HTMLFormElement);
        const payload = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            permissions: selectedPermissions,
        };

        createRoleMutation.mutate(payload, {
            onSuccess: (data) => {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess(data);
                }, 1500);
            },
            onError: (err: any) => {
                setError(err.message || 'Failed to create role. Please try again.');
            }
        });
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">Role Created!</h3>
                    <p className="text-gray-500">The system role has been successfully defined.</p>
                </div>
            </div>
        );
    }

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

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

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
                                    {isLoadingPermissions && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic animate-pulse">Loading permissions...</td>
                                        </tr>
                                    )}
                                    {matrixData.map((module) => (
                                        <div key={module.name} className="contents">
                                            <tr className="bg-gray-50/30">
                                                <td colSpan={5} className="px-6 py-2 text-[10px] font-bold text-pink-500 uppercase tracking-widest leading-none bg-pink-50/20 underline decoration-pink-500/30 underline-offset-4">{module.name}</td>
                                            </tr>
                                            {module.features.map((feature) => (
                                                <tr key={feature.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-gray-900 capitalize">{feature.name.replace(/-/g, ' ')}</div>
                                                    </td>
                                                    {(['read', 'create', 'update', 'delete'] as const).map((type) => {
                                                        const permId = feature.actions[type];
                                                        return (
                                                            <td key={type} className="px-4 py-4 text-center">
                                                                {permId ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => togglePermission(permId)}
                                                                        className={clsx(
                                                                            "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center mx-auto",
                                                                            selectedPermissions.includes(permId)
                                                                                ? "bg-pink-500 border-pink-500 text-white shadow-sm"
                                                                                : "border-gray-200 hover:border-pink-300"
                                                                        )}
                                                                    >
                                                                        {selectedPermissions.includes(permId) && <Check className="w-4 h-4 stroke-[3px]" />}
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto opacity-40">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
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
                        disabled={createRoleMutation.isPending}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98] font-sans"
                    >
                        {createRoleMutation.isPending ? (
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
