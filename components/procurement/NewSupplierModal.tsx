'use client';

import { useState } from 'react';
import {
    X, Save, Building, Users,
    Mail, Phone, MapPin, Globe,
    ShieldCheck, CreditCard, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface NewSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewSupplierModal({ isOpen, onClose }: NewSupplierModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        country: '',
        taxId: '',
        paymentTerms: 'Net 30',
        currency: 'USD'
    });

    const categories = ['Food & Beverage', 'Dry Goods', 'Cleaning Supplies', 'Wine & Spirits', 'Office Supplies', 'Maintenance'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Supplier Registered Successfully!');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Add New Supplier</h2>
                            <p className="text-sm text-gray-500">Onboard a new partner to your supply chain</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="col-span-full">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        Company Information
                                    </h3>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Company Name *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                        placeholder="e.g. Global Provisions Ltd"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Category *</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Contact Details */}
                                <div className="col-span-full pt-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Contact Details
                                    </h3>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Contact Person *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                        placeholder="Full Name"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            required
                                            type="email"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                            placeholder="contact@company.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Phone Number *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            required
                                            type="tel"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="url"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                            placeholder="https://..."
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Financial Info */}
                                <div className="col-span-full pt-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Financial & Compliance
                                    </h3>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Tax ID / VAT Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                        placeholder="Tax Identification"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Payment Terms</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                        value={formData.paymentTerms}
                                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    >
                                        <option value="COD">COD - Cash on Delivery</option>
                                        <option value="Net 15">Net 15</option>
                                        <option value="Net 30">Net 30</option>
                                        <option value="Net 60">Net 60</option>
                                    </select>
                                </div>

                                {/* Location */}
                                <div className="col-span-full pt-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Business Address
                                    </h3>
                                </div>
                                <div className="col-span-full space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Street Address</label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50/50"
                                        placeholder="Full address details..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                Data secured and encrypted
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-[#2a2b2d] text-white text-sm font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Register Supplier
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
