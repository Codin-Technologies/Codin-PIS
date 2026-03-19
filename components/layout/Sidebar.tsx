'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Package, ShoppingCart, Truck, BarChart3, Settings, Plus, UtensilsCrossed, FileText, LogOut } from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Kitchen', href: '/kitchen', icon: UtensilsCrossed },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen }: { isOpen: boolean }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const userInitial = session?.user?.email?.charAt(0).toUpperCase() || 'U';

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

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

            {/* Quick Action FAB (Asana style) - DROPDOWN */}
            <div className={clsx("px-4 py-4 flex flex-col relative", isOpen ? "items-start" : "items-center")}>
                <button
                    onClick={() => setIsCreateOpen(!isCreateOpen)}
                    className={clsx(
                        "flex items-center justify-center rounded-full bg-[#f06a6a] hover:bg-[#d95d5d] text-white transition-all shadow-md z-20",
                        isOpen ? "px-3 py-2 w-full space-x-2" : "w-10 h-10"
                    )}
                >
                    <Plus className={clsx("w-5 h-5 transition-transform duration-300", isCreateOpen && "rotate-45")} />
                    {isOpen && <span className="text-sm font-medium">Create New</span>}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isCreateOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={clsx(
                                "absolute left-4 right-4 top-16 bg-[#2a2b2d] border border-[#3e3f42] rounded-xl shadow-xl overflow-hidden z-10",
                                !isOpen && "left-12 top-0 w-48 ml-2" // Positioning for collapsed sidebar
                            )}
                        >
                            <div className="flex flex-col py-1">
                                <Link
                                    href="/inventory?action=new-item"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#3e3f42] hover:text-white transition-colors"
                                >
                                    <Package className="w-4 h-4 text-blue-400" />
                                    <span>New Item</span>
                                </Link>
                                <Link
                                    href="/procurement?action=new-req"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#3e3f42] hover:text-white transition-colors"
                                >
                                    <FileText className="w-4 h-4 text-green-400" />
                                    <span>New Requisition</span>
                                </Link>
                                <Link
                                    href="/procurement?tab=orders&action=new-po"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#3e3f42] hover:text-white transition-colors"
                                >
                                    <ShoppingCart className="w-4 h-4 text-orange-400" />
                                    <span>New PO</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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

            {/* Footer / User Profile & Logout */}
            <div className="p-4 border-t border-[#2a2b2d] mt-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 shrink-0 flex items-center justify-center font-bold text-white shadow-md">
                            {userInitial}
                        </div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="ml-3 overflow-hidden"
                                >
                                    <p className="text-sm font-medium text-white truncate w-32">
                                        {session?.user?.name || session?.user?.email?.split('@')[0] || "User"}
                                    </p>
                                    <p className="text-[10px] text-[#9ca6af] uppercase tracking-widest truncate">
                                        Session Active
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {isOpen && (
                        <button 
                            onClick={handleLogout}
                            className="p-2 ml-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex shrink-0"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                 </div>
                 {/* Compact logout for closed sidebar */}
                 {!isOpen && (
                     <button 
                         onClick={handleLogout}
                         className="mt-4 p-2 w-full flex justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                         title="Sign Out"
                     >
                         <LogOut className="w-5 h-5" />
                     </button>
                 )}
            </div>
        </motion.div>
    );
}
