import { useMutation } from '@tanstack/react-query';
import {
    changePassword,
    resetPassword,
    sendResetOTP,
    verifyResetOTP,
} from '@/lib/api';

/**
 * useAuthActions — specialized mutations for auth workflows
 * (Beyond standard login which is handled by next-auth)
 */
export function useAuthActions() {
    const changePasswordMutation = useMutation({
        mutationFn: changePassword,
    });

    const sendOTPMutation = useMutation({
        mutationFn: sendResetOTP,
    });

    const verifyOTPMutation = useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) => 
            verifyResetOTP(email, otp),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: (payload: { email: string; otp: string; new: string }) => 
            resetPassword(payload),
    });


    return {
        changePassword: changePasswordMutation,
        sendOTP: sendOTPMutation,
        verifyOTP: verifyOTPMutation,
        resetPassword: resetPasswordMutation,
    };
}
