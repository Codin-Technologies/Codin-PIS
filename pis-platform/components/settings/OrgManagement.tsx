'use client';

import { useState } from 'react';
import { Building2, MapPin, Globe, Plus, MoreHorizontal } from 'lucide-react';
import { CreateOrgForm } from './CreateOrgForm';
import { AnimatePresence, motion } from 'framer-motion';

const initialOrgs = [
    { id: 1, name: 'Headquarters (HQ)', type: 'Main Branch', location: 'Nairobi, Kenya', users: 45 },
    { id: 2, name: 'Mombasa Coastal Branch', type: 'Regional Hub', location: 'Mombasa, Kenya', users: 22 },
    { id: 3, name: 'Kampala Logistics', type: 'Distribution Center', location: 'Kampala, Uganda', users: 15 },
];

export function OrgManagement() {
    const [orgs, setOrgs] = useState(initialOrgs);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddOrg = (org: any) => {
        setOrgs([org, ...orgs]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Security Groups & Organizations</h3>
                    <p className="text-gray-500 text-sm">Organize your business into branches and security domains.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all font-sans"
                >
                    <Plus className="w-4 h-4" />
                    New Organization
                </button>
            </div>

            <div className="space-y-3">
                {orgs.map((org) => (
                    <div key={org.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-orange-500/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-900 text-lg">{org.name}</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                                        {org.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" /> {org.location}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Globe className="w-3 h-3" /> Global Security Group
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-gray-900">{org.users}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Staff</div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                <MoreHorizontal className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Organization Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                        >
                            <CreateOrgForm
                                onClose={() => setIsModalOpen(false)}
                                onSuccess={handleAddOrg}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
