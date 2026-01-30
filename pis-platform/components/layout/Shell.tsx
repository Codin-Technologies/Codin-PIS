'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Menu } from 'lucide-react';

export function Shell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Toggle function
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f9fafe]">
            {/* Sidebar - Controlled by state */}
            <Sidebar isOpen={isSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
                <Header onMenuClick={toggleSidebar} />
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
