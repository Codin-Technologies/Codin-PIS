import React from 'react';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-[#f8f9fa] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-inner">
                <span className="text-sm font-black tracking-tighter text-white">PIS</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold tracking-tight text-gray-900">Supplier Portal</h1>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
                  Procurement Excellence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-gray-900">Secure Session</p>
                <p className="text-[10px] text-gray-500">Encrypted Connection</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-100 bg-green-50">
                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-20 border-t border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8 md:flex-row">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} PIS SaaS Platform. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs font-medium text-gray-400">
              <a href="#" className="transition-colors hover:text-gray-900">Terms of Service</a>
              <a href="#" className="transition-colors hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-gray-900">Support Portal</a>
            </div>
          </div>
        </footer>
      </div>
    </QueryProvider>
  );
}
