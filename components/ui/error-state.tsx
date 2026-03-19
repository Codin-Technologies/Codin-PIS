'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff, ShieldAlert, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface ErrorStateProps {
    title?: string;
    message?: string;
    error?: Error | null;
    onRetry?: () => void;
    variant?: 'default' | 'glass' | 'minimal';
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    message,
    error,
    onRetry,
    variant = 'glass',
    className
}: ErrorStateProps) {
    const displayMessage = message || error?.message || 'An unexpected error occurred while fetching data.';
    
    // Determine icon based on message content
    const isOffline = displayMessage.toLowerCase().includes('network') || displayMessage.toLowerCase().includes('fetch');
    const Icon = isOffline ? WifiOff : AlertCircle;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "flex flex-col items-center justify-center p-8 rounded-3xl text-center",
                variant === 'glass' && "bg-white/40 backdrop-blur-md border border-white/20 shadow-xl shadow-red-500/5",
                variant === 'default' && "bg-red-50 border border-red-100",
                variant === 'minimal' && "p-0 bg-transparent",
                className
            )}
        >
            <div className="relative mb-6">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="h-20 w-20 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/20"
                >
                    <Icon className="h-10 w-10 text-white" />
                </motion.div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border-2 border-red-500 flex items-center justify-center animate-pulse">
                    <ShieldAlert className="h-3 w-3 text-red-500" />
                </div>
            </div>

            <h3 className="text-xl font-black tracking-tight text-gray-900 mb-2">
                {title}
            </h3>
            
            <p className="max-w-xs text-sm text-gray-500 font-medium leading-relaxed mb-8">
                {displayMessage}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="group flex items-center gap-2 px-6 py-3 bg-[#2a2b2d] text-white rounded-2xl font-bold text-sm hover:bg-black transition-all hover:shadow-lg active:scale-95"
                >
                    <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                    Try Again
                </button>
            )}
        </motion.div>
    );
}

/**
 * Full page error wrapper
 */
export function FullPageError(props: ErrorStateProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full p-4">
            <ErrorState {...props} className="max-w-md w-full" />
        </div>
    );
}
