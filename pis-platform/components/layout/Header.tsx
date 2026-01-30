'use client';
import { Bell, Search, Menu } from 'lucide-react';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-[#2a2b2d] bg-[#1e1f21] px-6 shadow-sm">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onMenuClick}
                    className="rounded p-1 text-pink-500 hover:bg-[#2d2e30] focus:outline-none transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 tracking-tight">Home</h2>
            </div>

            {/* Search Bar (Asana style center) */}
            <div className="hidden flex-1 max-w-lg mx-8 md:block">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-full bg-[#2a2b2d] border-none py-1.5 pl-10 pr-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:bg-[#2a2b2d] transition-all"
                        placeholder="Search..."
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="rounded-full p-1 text-gray-400 hover:bg-[#2d2e30] transition-colors">
                    <Bell className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
