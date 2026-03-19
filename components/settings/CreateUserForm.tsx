'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { X, Shield, Building2, User, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRoles, useOrganizations, useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import { User as UserType } from '@/lib/api';

interface CreateUserFormProps {
    onClose: () => void;
    onSuccess: (newUser: any) => void;
    user?: UserType;
}

export function CreateUserForm({ onClose, onSuccess, user }: CreateUserFormProps) {
    const { data: roles, isLoading: isLoadingRoles } = useRoles();
    const { data: organizations, isLoading: isLoadingOrgs } = useOrganizations();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const isEdit = !!user;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.target as HTMLFormElement);
        const payload: any = {
            fullName: formData.get('fullName') as string,
            email: formData.get('email') as string,
            roleId: formData.get('roleId') as string,
            organizationId: formData.get('organizationId') as string,
        };

        const password = formData.get('password') as string;
        if (password) payload.password = password;

        if (isEdit) {
            updateUserMutation.mutate({ id: user!.id, payload }, {
                onSuccess: (data) => {
                    setSuccess(true);
                    setTimeout(() => {
                        onSuccess(data);
                    }, 1500);
                },
                onError: (err: any) => {
                    setError(err.message || 'Failed to update user. Please try again.');
                }
            });
        } else {
            createUserMutation.mutate(payload as any, {
                onSuccess: (data) => {
                    setSuccess(true);
                    setTimeout(() => {
                        onSuccess(data);
                    }, 1500);
                },
                onError: (err: any) => {
                    setError(err.message || 'Failed to create user. Please try again.');
                }
            });
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">{isEdit ? 'User Updated!' : 'User Created!'}</h3>
                    <p className="text-gray-500">The system user has been successfully {isEdit ? 'updated' : 'added'}.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit User details' : 'Create New User account'}</h2>
                        <p className="text-gray-500 text-sm">{isEdit ? `Update profile for ${user?.fullName}` : 'Grant access to the PIS platform.'}</p>
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field>
                        <FieldLabel htmlFor="fullName" className="text-xs uppercase tracking-widest font-bold text-gray-400">Full Name</FieldLabel>
                        <Input
                            id="fullName"
                            name="fullName"
                            placeholder="e.g. John Doe"
                            required
                            defaultValue={user?.fullName}
                            className="h-12 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 rounded-xl"
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-gray-400">Email Address</FieldLabel>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@pis-system.com"
                            required
                            defaultValue={user?.email}
                            className="h-12 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 rounded-xl"
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="password" className="text-xs uppercase tracking-widest font-bold text-gray-400">{isEdit ? 'New Password (Optional)' : 'Password'}</FieldLabel>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required={!isEdit}
                                className="h-12 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 rounded-xl pl-10"
                            />
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="roleId" className="text-xs uppercase tracking-widest font-bold text-gray-400">System Role</FieldLabel>
                        <div className="relative">
                            <select
                                id="roleId"
                                name="roleId"
                                className="w-full h-12 px-4 appearance-none bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all disabled:opacity-50"
                                defaultValue={user?.roleId || ""}
                                required
                                disabled={isLoadingRoles}
                            >
                                <option value="" disabled>{isLoadingRoles ? 'Loading roles...' : 'Select a role...'}</option>
                                {roles?.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                            <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="organizationId" className="text-xs uppercase tracking-widest font-bold text-gray-400">Security Group / Org</FieldLabel>
                        <div className="relative">
                            <select
                                id="organizationId"
                                name="organizationId"
                                className="w-full h-12 px-4 appearance-none bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all disabled:opacity-50"
                                defaultValue={user?.organizationId || ""}
                                required
                                disabled={isLoadingOrgs}
                            >
                                <option value="" disabled>{isLoadingOrgs ? 'Loading organizations...' : 'Select organization...'}</option>
                                {organizations?.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                            <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </Field>
                </FieldGroup>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={createUserMutation.isPending || updateUserMutation.isPending}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                        {createUserMutation.isPending || updateUserMutation.isPending ? (
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                {isEdit ? 'Updating...' : 'Creating...'}
                            </div>
                        ) : isEdit ? "Save Changes" : "Create User account"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
