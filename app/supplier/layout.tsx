import React from 'react';

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Universal Supplier Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
              <span className="text-white font-black text-sm tracking-tighter">PIS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-gray-900 text-sm tracking-tight">Supplier Portal</h1>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Procurement Excellence</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">Secure Session</p>
              <p className="text-[10px] text-gray-500">Encrypted Connection</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} PIS SaaS Platform. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-400 font-medium">
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Support Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
