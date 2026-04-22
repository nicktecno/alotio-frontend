'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { AdminUserListRow } from '@/types';
import { ADMIN_LIST_PAGE_SIZE } from '@/types';
import Loading from '@/components/Loading';

export default function AdminUsuariosPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserListRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminGetUsers({
        page: String(page),
        limit: String(ADMIN_LIST_PAGE_SIZE),
      });
      if (res.totalPages >= 1 && page > res.totalPages) {
        setPage(res.totalPages);
        return;
      }
      setUsers(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este usuário? Todos os dados relacionados serão removidos.')) return;
    try {
      await api.adminDeleteUser(id);
      toast.success('Usuário deletado');
      loadUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleSendReminder = async (id: string) => {
    setSendingReminderId(id);
    try {
      await api.adminSendProfileReminder(id);
      toast.success('E-mail de lembrete enviado');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar lembrete');
    } finally {
      setSendingReminderId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuários</h1>

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ativo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Criado em</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.isActive ? 'text-green-600' : 'text-red-500'}>
                        {u.isActive ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {u.id === currentUser?.id ? (
                        <span className="text-gray-400 text-xs italic">Você</span>
                      ) : (
                        <>
                          {!u.profile && (
                            <button
                              type="button"
                              onClick={() => handleSendReminder(u.id)}
                              disabled={!!sendingReminderId}
                              className="text-primary hover:text-primary-700 text-xs font-medium disabled:opacity-50"
                            >
                              {sendingReminderId === u.id ? 'Enviando...' : 'Enviar lembrete'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Deletar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && total > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
              <p>
                {total} usuário{total === 1 ? '' : 's'}
                {totalPages > 1 && (
                  <>
                    {' '}
                    · página {page} de {totalPages} ({ADMIN_LIST_PAGE_SIZE} por página)
                  </>
                )}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
