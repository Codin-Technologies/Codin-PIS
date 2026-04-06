'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import { 
  Building2, Calendar, FileText, Upload, AlertCircle, 
  CheckCircle2, Clock, MapPin, ChevronDown, ChevronUp, DollarSign, Loader2, Download
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type RFQStatus = 'open' | 'closed' | 'expired';

interface LineItem {
  id: string;
  name: string;
  specification: string;
  quantity: number;
  unit: string;
}

interface RFQData {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  issuingCompany: string;
  deadline: string;
  status: RFQStatus;
  terms: string;
  items: LineItem[];
  attachments: { name: string; size: string }[];
}

// --- Mock API Fetch ---
const fetchMockRFQ = async (token: string): Promise<RFQData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (token === 'invalid-token') {
        reject(new Error('Invalid token'));
        return;
      }
      
      const status: RFQStatus = token === 'expired-token' ? 'expired' : token === 'closed-token' ? 'closed' : 'open';

      resolve({
        id: 'req-12345',
        referenceNumber: 'RFQ-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9000 + 1000),
        title: 'Q3 Enterprise Hardware Procurement',
        description: 'Supply and delivery of IT hardware equipment including high-performance laptops and peripheral accessories for the engineering department.',
        issuingCompany: 'Codin Technologies Ltd',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
        status,
        terms: '1. Quotations must be valid for at least 30 days.\n2. Delivery must be strictly within the specified lead time.\n3. Defective items must be replaced within 48 hours of notification.',
        items: [
          { id: 'item-1', name: 'ThinkPad X1 Extreme G5', specification: 'Intel Core i9, 64GB RAM, 2TB SSD NVMe', quantity: 15, unit: 'pcs' },
          { id: 'item-2', name: 'Dell UltraSharp 32"', specification: '4K USB-C Hub Monitor (U3223QE)', quantity: 30, unit: 'pcs' },
          { id: 'item-3', name: 'Logitech MX Master 3S', specification: 'Wireless Performance Mouse, Graphite', quantity: 20, unit: 'pcs' },
        ],
        attachments: [
          { name: 'Hardware_Specifications_v2.pdf', size: '2.4 MB' },
          { name: 'Vendor_Compliance_Guidelines.pdf', size: '1.1 MB' }
        ]
      });
    }, 1200);
  });
};

export default function SupplierRFQPortal({ params }: { params: Promise<{ token: string }> }) {
  const unwrappedParams = use(params);
  const { token } = unwrappedParams;

  const [rfq, setRfq] = useState<RFQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<'invalid' | 'expired' | 'closed' | null>(null);

  useEffect(() => {
    fetchMockRFQ(token)
      .then(data => {
        if (data.status === 'expired') setErrorType('expired');
        else if (data.status === 'closed') setErrorType('closed');
        else setRfq(data);
      })
      .catch((err) => {
        console.error(err);
        setErrorType('invalid');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Retrieving Secure Document</h2>
        <p className="text-gray-500 mt-2 text-sm text-center">Verifying access token and loading RFQ details...</p>
      </div>
    );
  }

  if (errorType) {
    return <ErrorState type={errorType} />;
  }

  if (!rfq) return null;

  return <RFQWorkflow rfq={rfq} token={token} />;
}

// --- Components ---

function ErrorState({ type }: { type: 'invalid' | 'expired' | 'closed' }) {
  const content = {
    invalid: { title: 'Invalid RFQ Link', desc: 'The link provided does not exist or has been malformed. Please request a new invitation from the issuer.' },
    expired: { title: 'This RFQ has expired', desc: 'The submission deadline for this request has passed. Responses are no longer being accepted.' },
    closed: { title: 'RFQ Closed', desc: 'The issuing organization has stopped accepting responses for this sourcing event.' }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">{content[type].title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed">{content[type].desc}</p>
      </div>
    </div>
  );
}

function RFQWorkflow({ rfq, token }: { rfq: RFQData, token: string }) {
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [termsOpen, setTermsOpen] = useState(false);

  // Form State
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [leadTimes, setLeadTimes] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  
  const [currency, setCurrency] = useState('USD');
  const [validity, setValidity] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [incoterms, setIncoterms] = useState('');

  const subtotal = useMemo(() => {
    return rfq.items.reduce((acc, item) => {
      const price = prices[item.id] || 0;
      return acc + (price * item.quantity);
    }, 0);
  }, [rfq.items, prices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionState('submitting');
    
    // Simulate API POST
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmissionState('success');
  };

  if (submissionState === 'success') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-3xl shadow-xl border border-green-100 max-w-lg w-full text-center"
        >
          <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 shadow-inner shadow-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Quotation Submitted</h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Your response to <strong>{rfq.referenceNumber}</strong> has been securely transmitted to {rfq.issuingCompany}.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100 mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Confirmation Details</p>
            <p className="text-sm font-medium text-gray-900">Timestamp: {new Date().toLocaleString()}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">Total Value: {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(subtotal)}</p>
          </div>
          <button onClick={() => window.print()} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
            Download PDF Receipt
          </button>
        </motion.div>
      </div>
    );
  }

  const isFormValid = subtotal > 0 && validity && paymentTerms && incoterms && Object.keys(prices).length === rfq.items.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-32">
      
      {/* 1. RFQ Access Page & Summary */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
             <Building2 className="w-64 h-64 -mt-16 -mr-16" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-2">Request For Quotation</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{rfq.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
                <span className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                  <FileText className="h-4 w-4 text-gray-400" /> {rfq.referenceNumber}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                  <Building2 className="h-4 w-4 text-gray-400" /> {rfq.issuingCompany}
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-auto min-w-[200px]">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Submission Deadline</p>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-orange-400" />
                <span className="text-xl font-bold">{new Date(rfq.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed text-sm max-w-3xl">{rfq.description}</p>
          </div>

          <div className="border border-gray-100 rounded-2xl bg-gray-50/50 overflow-hidden">
            <button 
              onClick={() => setTermsOpen(!termsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
            >
              <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                Terms & Conditions
              </span>
              {termsOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
            </button>
            <AnimatePresence>
              {termsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-5 pt-2 text-sm text-gray-600 whitespace-pre-line leading-relaxed"
                >
                  {rfq.terms}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Attachments ({rfq.attachments.length})</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {rfq.attachments.map((file, idx) => (
                  <div key={idx} className="border border-gray-200 p-4 rounded-xl flex items-start gap-4 bg-white hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{file.size}</p>
                      <button className="text-[10px] uppercase font-bold tracking-widest text-blue-600 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="h-3 w-3" /> Download
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 2. Response Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Quotation Response</h2>
              <p className="text-xs text-gray-500 mt-1">Provide your pricing and lead times for the requested items.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-2">
              <label className="text-sm font-bold text-gray-500">Currency:</label>
              <select 
                value={currency} 
                onChange={e => setCurrency(e.target.value)}
                className="bg-white border border-gray-200 text-sm font-bold text-gray-900 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b-2 border-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Item & Specifications</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Req. Qty</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-48">Unit Price <span className="text-red-500">*</span></th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-40">Lead Time <span className="text-red-500">*</span></th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rfq.items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 group focus-within:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-5 whitespace-normal min-w-[250px]">
                      <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.specification}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-md">{item.quantity}</span>
                      <span className="text-xs text-gray-500 ml-1 font-medium">{item.unit}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-sm font-bold">{currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}</span>
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          required
                          value={prices[item.id] === undefined ? '' : prices[item.id]}
                          onChange={(e) => setPrices({...prices, [item.id]: parseFloat(e.target.value)})}
                          className="pl-8 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <input 
                          type="text" 
                          required
                          value={leadTimes[item.id] || ''}
                          onChange={(e) => setLeadTimes({...leadTimes, [item.id]: e.target.value})}
                          className="px-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                          placeholder="e.g. 5 days"
                        />
                    </td>
                    <td className="px-6 py-5">
                       <input 
                          type="text" 
                          value={remarks[item.id] || ''}
                          onChange={(e) => setRemarks({...remarks, [item.id]: e.target.value})}
                          className="px-4 py-2.5 w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded-none text-sm text-gray-900 outline-none transition-all"
                          placeholder="Optional notes..."
                        />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-900">
                <tr>
                  <td colSpan={2} className="px-6 py-6 text-right font-bold text-gray-400 uppercase tracking-widest text-xs">
                    Estimated Subtotal
                  </td>
                  <td colSpan={3} className="px-6 py-6 pl-[4.5rem]">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-white tracking-tight">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(subtotal)}
                      </span>
                      {subtotal === 0 && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md font-medium border border-gray-700">Awaiting input</span>}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-widest">Quotation Validity <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="date" 
                  required
                  value={validity}
                  onChange={(e) => setValidity(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-widest">Payment Terms <span className="text-red-500">*</span></label>
              <select 
                required
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="px-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">Select terms...</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Cash in Advance">Cash in Advance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-widest">Delivery Terms <span className="text-red-500">*</span></label>
              <select 
                required
                value={incoterms}
                onChange={e => setIncoterms(e.target.value)}
                className="px-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">Select Incoterms...</option>
                <option value="DDP - Delivered Duty Paid">DDP (Delivered Duty Paid)</option>
                <option value="DAP - Delivered at Place">DAP (Delivered at Place)</option>
                <option value="EXW - Ex Works">EXW (Ex Works)</option>
                <option value="FOB - Free on Board">FOB (Free on Board)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3. Attachments */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
           <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Supporting Documents</h3>
              <p className="text-xs text-gray-500 mt-1">Upload your official quotation PDF, spec sheets, or certifications.</p>
           </div>
           
           <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors group">
              <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Drag & drop files here</h4>
              <p className="text-xs text-gray-500 mt-1 mb-4">Or click to browse from your computer</p>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">PDF, DOCX, XLSX (Max 10MB)</span>
           </div>
        </section>

        {/* 4. Submission Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="hidden sm:block">
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Total Quotation Value</p>
              <p className="text-xl font-black text-gray-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(subtotal)}</p>
            </div>
            
            <div className="flex w-full sm:w-auto gap-4">
              <button 
                type="button"
                className="px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto hidden sm:block"
                disabled={submissionState !== 'idle'}
              >
                Save Draft
              </button>
              <button 
                type="submit"
                disabled={!isFormValid || submissionState !== 'idle'}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {submissionState === 'submitting' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    Submit Quotation
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
