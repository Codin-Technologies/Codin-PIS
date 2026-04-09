'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldAlert } from 'lucide-react';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';

export function FirstLoginPasswordPrompt() {
    const { data: session, update } = useSession();
    const [isCompleting, setIsCompleting] = useState(false);

    if (!session?.user?.id || !session.user.mustChangePassword) {
        return null;
    }

    const handlePasswordUpdated = async () => {
        setIsCompleting(true);

        try {
            await update({
                mustChangePassword: false,
                lastLoginAt: session.user.lastLoginAt ?? null,
                loginAt: session.user.loginAt ?? new Date().toISOString(),
            });
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101113]/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#17181b] p-6 shadow-2xl shadow-black/30 sm:p-8">
                <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300/80">
                            Security Check
                        </p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                            Create a new password before continuing
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-300">
                            This account does not have a previous login on record, so we are treating
                            this as a first-time sign-in. Please replace your current password before
                            accessing the platform.
                        </p>
                    </div>
                </div>

                <ChangePasswordForm
                    userId={session.user.id}
                    title="Set your new password"
                    description="Use your current login password once, then create a new secure password to unlock the workspace."
                    submitLabel={isCompleting ? 'Finalizing Session...' : 'Save New Password'}
                    onSuccess={handlePasswordUpdated}
                />
            </div>
        </div>
    );
}
