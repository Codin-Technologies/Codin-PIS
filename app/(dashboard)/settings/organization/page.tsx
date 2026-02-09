'use client';

import { useState } from 'react';
import { Users, Shield, Building2, Settings } from 'lucide-react';
import { UserManagement } from '@/components/settings/UserManagement';
import { RoleManagement } from '@/components/settings/RoleManagement';
import { OrgManagement } from '@/components/settings/OrgManagement';
import clsx from 'clsx';

const TABS = [
    { id: 'users', label: 'Users', icon: Users, component: UserManagement },
    { id: 'roles', label: 'Roles', icon: Shield, component: RoleManagement },
    { id: 'orgs', label: 'Organizations', icon: Building2, component: OrgManagement },
];

export default function OrganizationSettingsPage() {
    const [activeTab, setActiveTab] = useState('users');

    const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || UserManagement;

    return (
        <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">
            {/* Header */}
            <div className="flex items-center justify-between rounded-2xl bg-[#1e1f21] p-8 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                        <Settings className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Organization Settings</h1>
                        <p className="text-gray-400 mt-1">Manage users, permissions, and business units.</p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 p-1.5 bg-[#202123]/50 backdrop-blur-sm border border-white/5 rounded-2xl w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300",
                            activeTab === tab.id
                                ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/20"
                                : "text-[#9ca6af] hover:text-white hover:bg-white/5"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1">
                <ActiveComponent />
            </div>
        </div>
    );
}
