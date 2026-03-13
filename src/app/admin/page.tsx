'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';
import Loading from '@/components/Loading';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.adminGetStats().then((data) => setStats(data as DashboardStats));
  }, []);

  if (!stats) return <Loading />;

  const cards = [
    { label: 'Total Usuários', value: stats.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Perfis', value: stats.totalProfiles, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Perfis Pendentes', value: stats.pendingProfiles, color: 'text-primary', bg: 'bg-primary-50' },
    { label: 'Assinaturas Ativas', value: stats.activeSubscriptions, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-5 border border-gray-100`}>
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
