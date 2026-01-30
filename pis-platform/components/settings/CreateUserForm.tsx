'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { X, Shield, Building2, User } from 'lucide-react';

interface CreateUserFormProps {
    onClose: () => void;
    onSuccess: (newUser: any) => void;
}

export function CreateUserForm({ onClose, onSuccess }: CreateUserFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const formData = new FormData(e.target as HTMLFormElement);
        const newUser = {
            id: Math.random(),
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role') || 'Standard User',
            status: 'Active',
        };

        onSuccess(newUser);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                        <p className="text-gray-500 text-sm">Grant access to the PIS platform.</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field>
                        <FieldLabel htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-gray-400">Full Name</FieldLabel>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. John Doe"
                            required
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
                            className="h-12 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 rounded-xl"
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="role" className="text-xs uppercase tracking-widest font-bold text-gray-400">System Role</FieldLabel>
                        <div className="relative">
                            <select
                                id="role"
                                name="role"
                                className="w-full h-12 px-4 appearance-none bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                                defaultValue=""
                                required
                            >
                                <option value="" disabled>Select a role...</option>
                                <option value="Super Admin">Super Admin</option>
                                <option value="Procurement Manager">Procurement Manager</option>
                                <option value="Kitchen Lead">Kitchen Lead</option>
                                <option value="Standard User">Standard User</option>
                            </select>
                            <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="org" className="text-xs uppercase tracking-widest font-bold text-gray-400">Security Group / Org</FieldLabel>
                        <div className="relative">
                            <select
                                id="org"
                                name="org"
                                className="w-full h-12 px-4 appearance-none bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                                defaultValue=""
                                required
                            >
                                <option value="" disabled>Select organization...</option>
                                <option value="HQ">Headquarters (HQ)</option>
                                <option value="Coastal">Mombasa Coastal Branch</option>
                                <option value="Kampala">Kampala Logistics</option>
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
                        disabled={isLoading}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                Creating...
                            </div>
                        ) : "Create User account"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
