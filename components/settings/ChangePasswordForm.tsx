'use client';

import { useState } from 'react';
import { changePasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function ChangePasswordForm({ userId }: { userId: string }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        setIsLoading(true);

        try {
            await changePasswordAction(userId, oldPassword, newPassword);
            setSuccess("Password changed successfully.");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || "Failed to change password. Please verify your old password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500">Update your account security credentials.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Field>
                    <FieldLabel className="text-gray-700 text-xs font-bold uppercase tracking-wider">Current Password</FieldLabel>
                    <Input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:ring-orange-500 rounded-xl"
                        placeholder="Enter current password"
                    />
                </Field>

                <Field>
                    <FieldLabel className="text-gray-700 text-xs font-bold uppercase tracking-wider">New Password</FieldLabel>
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:ring-orange-500 rounded-xl"
                        placeholder="Minimum 8 characters"
                    />
                </Field>

                <Field>
                    <FieldLabel className="text-gray-700 text-xs font-bold uppercase tracking-wider">Confirm New Password</FieldLabel>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:ring-orange-500 rounded-xl"
                        placeholder="Re-type new password"
                    />
                </Field>

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-xl py-6 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Updating Security...
                            </span>
                        ) : 'Update Password'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
