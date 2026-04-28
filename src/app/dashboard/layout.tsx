'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Header from '@/components/Header';
import DashboardSidebar from '@/components/DashboardSidebar';
import FullScreenLoading from '@/components/FullScreenLoading';
import EmailCaptureModal from '@/components/EmailCaptureModal';
import TransportadorTermsModal from '@/components/TransportadorTermsModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (!user) return null;

  const showEmailCapture =
    user.role === 'TIO' && user.mustCaptureEmail === true;

  const needsTransportadorTerms =
    user.role === 'TIO' &&
    !user.mustCaptureEmail &&
    !user.transportadorTermsAcceptedAt;

  return (
    <div className="min-h-screen bg-gray-50">
      {showEmailCapture && <EmailCaptureModal />}
      {!showEmailCapture && needsTransportadorTerms && (
        <TransportadorTermsModal />
      )}
      <Header />
      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mb-4 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            aria-label="Abrir menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Menu
          </button>
          {children}
        </main>
      </div>
    </div>
  );
}
