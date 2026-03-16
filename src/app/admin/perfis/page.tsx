'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, assetUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Profile } from '@/types';
import Loading from '@/components/Loading';

export default function AdminPerfisPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProfiles = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filter) params.status = filter;
    const data = await api.adminGetProfiles(params);
    setProfiles(data as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (id: string) => {
    try {
      await api.adminApproveProfile(id);
      toast.success('Perfil aprovado!');
      loadProfiles();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;
    try {
      await api.adminRejectProfile(id, reason);
      toast.success('Perfil rejeitado');
      loadProfiles();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este perfil?')) return;
    try {
      await api.adminDeleteProfile(id);
      toast.success('Perfil deletado');
      loadProfiles();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-primary-100 text-primary-700',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PAUSED: 'bg-amber-100 text-amber-800',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
    PAUSED: 'Pausado',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Perfis</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
          <option value="PAUSED">Pausados</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : profiles.length === 0 ? (
        <p className="text-gray-500">Nenhum perfil encontrado.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prefixo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Documento</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.displayName}</td>
                  <td className="px-4 py-3 text-gray-600">{p.prefixo}</td>
                  <td className="px-4 py-3 text-gray-600">{p.city?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}>
                      {statusLabels[p.status] || p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.documents?.[0] && (
                      <a
                        href={assetUrl(p.documents[0].fileUrl) || p.documents[0].fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Ver documento
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/perfis/${p.id}`}
                      className="text-primary hover:text-primary-600 text-xs font-medium"
                    >
                      Ver / Editar
                    </Link>
                    {p.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="text-green-600 hover:text-green-700 text-xs font-medium"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="text-red-600 hover:text-red-700 text-xs font-medium"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-gray-400 hover:text-red-600 text-xs font-medium"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
