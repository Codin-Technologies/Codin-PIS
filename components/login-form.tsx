'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { sendOtpAction, verifyOtpAction, resetPasswordAction } from "@/app/actions/auth";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type AuthStep = 'login' | 'forgot_password_email' | 'forgot_password_otp' | 'reset_password';

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    const [step, setStep] = useState<AuthStep>('login');
    const [isLoading, setIsLoading] = useState(false);
    
    // Auth generic messages
    const [authError, setAuthError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Reset password state
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
    });

    const clearMessages = () => {
        setAuthError(null);
        setSuccessMessage(null);
    };

    const onSubmitLogin = async (data: LoginFormValues) => {
        setIsLoading(true);
        clearMessages();

        try {
            const res = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (res?.error) {
                setAuthError("Invalid email or password");
                setIsLoading(false);
            } else if (res?.ok) {
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            setAuthError("An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) {
            setAuthError("Please enter your email address");
            return;
        }
        setIsLoading(true);
        clearMessages();
        try {
            await sendOtpAction(resetEmail);
            setSuccessMessage("An OTP has been sent to your email.");
            setStep('forgot_password_otp');
        } catch (err: any) {
            setAuthError(err.message || "Failed to send OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetOtp) {
            setAuthError("Please enter the 6-digit OTP");
            return;
        }
        setIsLoading(true);
        clearMessages();
        try {
            await verifyOtpAction(resetEmail, resetOtp);
            setSuccessMessage("OTP verified successfully. Please enter your new password.");
            setStep('reset_password');
        } catch (err: any) {
            setAuthError(err.message || "Invalid or expired OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            setAuthError("Please fill all password fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            setAuthError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        clearMessages();
        try {
            await resetPasswordAction(resetEmail, newPassword);
            setSuccessMessage("Password reset successfully. You can now log in.");
            setStep('login');
        } catch (err: any) {
            setAuthError(err.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = (title: string, description: string) => (
        <div className="flex flex-col items-start gap-1 text-left mb-8 relative">
            {step !== 'login' && (
                <button 
                    type="button" 
                    onClick={() => { setStep('login'); clearMessages(); }}
                    className="absolute -top-8 -left-2 text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs uppercase tracking-widest font-bold"
                >
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                </button>
            )}
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
                {title}
            </h1>
            <p className="text-[#9ca6af] text-base font-medium">
                {description}
            </p>
        </div>
    );

    const renderAlerts = () => (
        <>
            {authError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md mb-4 text-center">
                    {authError}
                </div>
            )}
            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-md mb-4 text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {successMessage}
                </div>
            )}
        </>
    );

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {step === 'login' && (
                <form onSubmit={handleSubmit(onSubmitLogin)} className="flex flex-col gap-6">
                    <FieldGroup>
                        {renderHeader("Welcome back", "Enter your credentials to manage your supply chain.")}
                        {renderAlerts()}

                        <Field>
                            <FieldLabel htmlFor="email" className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Email Address</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                {...register("email", { required: true })}
                                placeholder="admin@pis-system.com"
                                className="bg-[#2a2b2d] border-[#3a3b3d] text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 transition-all rounded-xl h-12"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </Field>

                        <Field>
                            <div className="flex items-center">
                                <FieldLabel htmlFor="password" className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Password</FieldLabel>
                                <button
                                    type="button"
                                    onClick={() => { setStep('forgot_password_email'); clearMessages(); }}
                                    className="ml-auto text-xs text-pink-500 hover:text-pink-400 transition-colors bg-transparent border-none p-0"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                className="bg-[#2a2b2d] border-[#3a3b3d] text-white focus:ring-2 focus:ring-pink-500 transition-all rounded-xl h-12"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </Field>

                        <Field>
                            <div className="flex items-center gap-2 py-1">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    {...register("remember")}
                                    className="h-4 w-4 rounded border-[#3a3b3d] bg-[#2a2b2d] text-pink-500 focus:ring-pink-500 accent-pink-500"
                                />
                                <FieldLabel htmlFor="remember" className="font-normal text-[#9ca6af] text-sm">
                                    Keep me logged in
                                </FieldLabel>
                            </div>
                        </Field>

                        <Field className="mt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                        Authenticating...
                                    </div>
                                ) : "Sign In to Platform"}
                            </Button>
                        </Field>

                        <Field>
                            <FieldDescription className="text-center text-[#9ca6af] text-sm">
                                New to Codin PIS?{" "}
                                <a href="#" className="text-white hover:text-pink-400 transition-colors font-semibold">
                                    Request access
                                </a>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </form>
            )}

            {step === 'forgot_password_email' && (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
                    <FieldGroup>
                        {renderHeader("Reset Password", "Enter your email address to receive an OTP.")}
                        {renderAlerts()}

                        <Field>
                            <FieldLabel htmlFor="resetEmail" className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Email Address</FieldLabel>
                            <Input
                                id="resetEmail"
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="name@yourcompany.com"
                                className="bg-[#2a2b2d] border-[#3a3b3d] text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 transition-all rounded-xl h-12"
                                required
                            />
                        </Field>

                        <Field className="mt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-white text-gray-900 font-bold text-lg shadow-lg hover:bg-gray-100 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? "Sending OTP..." : "Send Reset Code"}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            )}

            {step === 'forgot_password_otp' && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                    <FieldGroup>
                        {renderHeader("Enter OTP", `We sent a 6-digit code to ${resetEmail}.`)}
                        {renderAlerts()}

                        <Field>
                            <FieldLabel htmlFor="resetOtp" className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Verification Code</FieldLabel>
                            <Input
                                id="resetOtp"
                                type="text"
                                value={resetOtp}
                                onChange={(e) => setResetOtp(e.target.value)}
                                placeholder="000000"
                                className="bg-[#2a2b2d] border-[#3a3b3d] text-white placeholder-gray-500 text-center tracking-[0.5em] font-mono text-xl focus:ring-2 focus:ring-pink-500 transition-all rounded-xl h-12"
                                required
                                maxLength={6}
                            />
                        </Field>

                        <Field className="mt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-white text-gray-900 font-bold text-lg shadow-lg hover:bg-gray-100 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? "Verifying..." : "Verify Code"}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            )}

            {step === 'reset_password' && (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
                    <FieldGroup>
                        {renderHeader("New Password", "Format a strong and secure password.")}
                        {renderAlerts()}

                        <Field>
                            <FieldLabel htmlFor="newPassword" className="text-gray-300 text-xs uppercase tracking-wider font-semibold">New Password</FieldLabel>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-[#2a2b2d] border-[#3a3b3d] text-white focus:ring-2 focus:ring-pink-500 transition-all rounded-xl h-12"
                                required
                            />
                        </Field>
                        
                        <Field>
                            <FieldLabel htmlFor="confirmPassword" className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Confirm Password</FieldLabel>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-[#2a2b2d] border-[#3a3b3d] text-white focus:ring-2 focus:ring-pink-500 transition-all rounded-xl h-12"
                                required
                            />
                        </Field>

                        <Field className="mt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            )}

            {/* Footer remains static for all steps */}
            <div className="mt-6 flex flex-col items-center gap-2 border-t border-[#2a2b2d] pt-6 text-[10px] uppercase tracking-widest text-[#9ca6af]/60">
                <div className="flex items-center gap-4">
                    <span>Build 1.1.0-alpha</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_10px_oklch(0.723_0.219_149.579)]"></span>
                    <span>System Encrypted</span>
                </div>
                <p>© 2026 Codin Technologies. SECURE ACCESS ONLY.</p>
            </div>
        </div>
    )
}
