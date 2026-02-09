'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock login - just sets a cookie and redirects
        document.cookie = "session=active; path=/; max-age=86400"; // 24 hours

        router.push("/");
        router.refresh();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-start gap-1 text-left mb-8">
                    <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
                        Welcome back
                    </h1>
                    <p className="text-[#9ca6af] text-base font-medium">
                        Enter your credentials to manage your supply chain.
                    </p>
                </div>

                <Field>
                    <FieldLabel htmlFor="email" className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Email Address</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="admin@pis-system.com"
                        required
                        className="bg-[#2a2b2d] border-[#3a3b3d] text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 transition-all rounded-xl h-12"
                    />
                </Field>

                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password" className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Password</FieldLabel>
                        <a
                            href="#"
                            className="ml-auto text-xs text-pink-500 hover:text-pink-400 transition-colors"
                        >
                            Forgot password?
                        </a>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        className="bg-[#2a2b2d] border-[#3a3b3d] text-white focus:ring-2 focus:ring-pink-500 transition-all rounded-xl h-12"
                    />
                </Field>

                <Field>
                    <div className="flex items-center gap-2 py-1">
                        <input
                            type="checkbox"
                            id="remember"
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

            <div className="mt-6 flex flex-col items-center gap-2 border-t border-[#2a2b2d] pt-6 text-[10px] uppercase tracking-widest text-[#9ca6af]/60">
                <div className="flex items-center gap-4">
                    <span>Build 1.1.0-alpha</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_10px_oklch(0.723_0.219_149.579)]"></span>
                    <span>System Encrypted</span>
                </div>
                <p>© 2026 Codin Technologies. SECURE ACCESS ONLY.</p>
            </div>
        </form>
    )
}
