'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Header from '@/components/Header';
import AdminSidebar from '@/components/AdminSidebar';
import FullScreenLoading from '@/components/FullScreenLoading';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      <div className="flex w-full max-w-full overflow-x-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 w-full max-w-full p-2.5 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="lg:hidden mb-3 flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition min-h-[36px]"
              aria-label="Abrir menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>Menu Admin</span>
            </button>
            <span className="text-[11px] font-semibold text-gray-500">Painel Alô Tio</span>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
