'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { X, Building2, MapPin, Phone, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOrganizationTypes, useCreateOrganization, useUpdateOrganization } from '@/hooks/useUsers';
import { Organization } from '@/lib/api';

interface CreateOrgFormProps {
    onClose: () => void;
    onSuccess: (org: any) => void;
    organization?: Organization;
}

export function CreateOrgForm({ onClose, onSuccess, organization }: CreateOrgFormProps) {
    const isEditing = !!organization;
    const { data: orgTypes, isLoading: isLoadingTypes } = useOrganizationTypes();
    const createOrgMutation = useCreateOrganization();
    const updateOrgMutation = useUpdateOrganization();
    
    const mutation = isEditing ? updateOrgMutation : createOrgMutation;

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.target as HTMLFormElement);
        const payload = {
            name: formData.get('name') as string,
            organizationTypeId: formData.get('type') as string,
            location: formData.get('location') as string,
            contact: formData.get('phone') as string,
        };

        const mutationPayload = isEditing 
            ? { id: organization.id, payload } 
            : payload;

        (mutation.mutate as any)(mutationPayload, {
            onSuccess: (data: any) => {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess(data || { ...organization, ...payload });
                    onClose();
                }, 1500);
            },
            onError: (err: any) => {
                setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} organization. Please try again.`);
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
                    <h3 className="text-xl font-bold text-gray-900">Organization {isEditing ? 'Updated' : 'Created'}!</h3>
                    <p className="text-gray-500">The branch details have been successfully {isEditing ? 'updated' : 'registered'}.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit' : 'Add New'} Organization</h2>
                        <p className="text-gray-500 text-sm">{isEditing ? 'Modify branch details and settings.' : 'Register a new branch or security entity.'}</p>
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
                    <Field className="md:col-span-2">
                        <FieldLabel htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-gray-400">Organization Name</FieldLabel>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. Westlands Distribution Center"
                            required
                            defaultValue={organization?.name}
                            className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="type" className="text-xs uppercase tracking-widest font-bold text-gray-400">Organization Type</FieldLabel>
                        <div className="relative">
                            <select
                                id="type"
                                name="type"
                                className="w-full h-12 px-4 appearance-none bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-sans"
                                defaultValue={organization?.organizationTypeId || ""}
                                required
                                disabled={isLoadingTypes}
                            >
                                <option value="" disabled>{isLoadingTypes ? 'Loading types...' : 'Select type...'}</option>
                                {orgTypes?.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="location" className="text-xs uppercase tracking-widest font-bold text-gray-400">Primary Location</FieldLabel>
                        <div className="relative">
                            <Input
                                id="location"
                                name="location"
                                placeholder="City, Country"
                                required
                                defaultValue={organization?.location}
                                className="h-12 pl-10 border-gray-200 focus:border-orange-500 focus:focus:ring-orange-500/20 rounded-xl"
                            />
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </Field>

                    <Field className="md:col-span-2">
                        <FieldLabel htmlFor="phone" className="text-xs uppercase tracking-widest font-bold text-gray-400">Contact Number</FieldLabel>
                        <div className="relative">
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+254 700 000 000"
                                defaultValue={organization?.contact}
                                className="h-12 pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                            />
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </Field>
                </FieldGroup>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
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
                        disabled={mutation.isPending}
                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98] font-sans"
                    >
                        {mutation.isPending ? (
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                {isEditing ? 'Updating...' : 'Creating...'}
                            </div>
                        ) : isEditing ? "Update Organization" : "Register Organization"}
                    </Button>
                </div>
            </form>
        </div>
);
}
