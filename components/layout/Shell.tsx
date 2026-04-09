'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OnboardingController } from '@/onboarding/useOnboarding';
import { FirstLoginPasswordPrompt } from '@/components/auth/FirstLoginPasswordPrompt';

export function Shell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { data: session, status } = useSession();
    const isSessionLoading = status === 'loading';
    const mustChangePassword = Boolean(session?.user?.mustChangePassword);

    const expandSidebar = () => setIsSidebarOpen(true);
    const collapseSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f9fafe]">
            {!isSessionLoading && !mustChangePassword ? <OnboardingController /> : null}
            <div className={mustChangePassword ? 'pointer-events-none flex w-full select-none' : 'flex w-full'}>
                <Sidebar
                    isOpen={isSidebarOpen}
                    onMouseEnter={expandSidebar}
                    onMouseLeave={collapseSidebar}
                />

                <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
                    <Header onMenuClick={expandSidebar} isSidebarOpen={isSidebarOpen} />
                    <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
                        {children}
                    </main>
                </div>
            </div>
            {!isSessionLoading && mustChangePassword ? <FirstLoginPasswordPrompt /> : null}
        </div>
    );
}
