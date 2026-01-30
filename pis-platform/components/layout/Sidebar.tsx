'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Truck, BarChart3, Settings, Plus, UtensilsCrossed, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Kitchen', href: '/kitchen', icon: UtensilsCrossed },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings/organization', icon: Settings },
];

export function Sidebar({ isOpen }: { isOpen: boolean }) {
    const pathname = usePathname();

    return (
        <motion.div
            initial={{ width: 240 }}
            animate={{ width: isOpen ? 240 : 72 }}
            className="flex h-full flex-col bg-[#1e1f21] text-white transition-all duration-300 ease-in-out border-r border-[#2a2b2d]"
        >
            {/* Brand / Logo Area */}
            <div className="flex h-16 items-center px-4 border-b border-[#2a2b2d]">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-pink-500 to-orange-400 shrink-0">
                    <span className="text-xs font-bold text-white">PIS</span>
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="ml-3 text-lg font-semibold tracking-tight whitespace-nowrap"
                        >
                            PIS System
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Action FAB (Asana style) */}
            <div className={clsx("px-4 py-4 flex", isOpen ? "justify-start" : "justify-center")}>
                <button className={clsx(
                    "flex items-center justify-center rounded-full bg-[#f06a6a] hover:bg-[#d95d5d] text-white transition-all shadow-md",
                    isOpen ? "px-3 py-2 w-full space-x-2" : "w-10 h-10"
                )}>
                    <Plus className="w-5 h-5" />
                    {isOpen && <span className="text-sm font-medium">Create New</span>}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-4 px-2 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                isActive ? 'bg-[#2d2e30] text-white' : 'text-[#9ca6af] hover:bg-[#2d2e30] hover:text-white',
                                'group flex items-center rounded-md px-2 py-3 text-sm font-medium transition-colors',
                                !isOpen && 'justify-center'
                            )}
                            title={!isOpen ? item.name : undefined}
                        >
                            <item.icon className={clsx("h-6 w-6 flex-shrink-0", isOpen && "mr-3")} aria-hidden="true" />
                            {isOpen && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile if needed */}
            <div className="p-4 border-t border-[#2a2b2d]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 shrink-0 flex items-center justify-center text-xs">U</div>
                        {isOpen && (
                            <div className="ml-3 truncate">
                                <p className="text-sm font-medium">User</p>
                                <p className="text-xs text-[#9ca6af]">Admin</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                            window.location.href = "/login";
                        }}
                        className={clsx(
                            "rounded-md p-2 text-[#9ca6af] hover:bg-[#2d2e30] hover:text-white transition-colors",
                            !isOpen && "mx-auto"
                        )}
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
