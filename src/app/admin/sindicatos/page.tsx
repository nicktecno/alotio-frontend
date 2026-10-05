'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Store } from '@/types';

type AdminSindicato = Store & {
  user?: { email: string };
  _count?: { products: number };
};

export default function AdminSindicatosPage() {
  const [sindicatos, setSindicatos] = useState<AdminSindicato[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockedFilter, setBlockedFilter] = useState<'' | 'true' | 'false'>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        type: 'SINDICATO',
        page: String(page),
        limit: '30',
      };
      if (blockedFilter) params.blocked = blockedFilter;
      if (search) params.search = search;

      const res = await api.adminListStores(params);
      setSindicatos(res.data as AdminSindicato[]);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar sindicatos.');
    } finally {
      setLoading(false);
    }
  }, [blockedFilter, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const block = async (s: AdminSindicato) => {
    const reason = prompt(`Bloquear o sindicato/associação "${s.displayName}". Motivo:`);
    if (reason === null) return;
    try {
      await api.adminBlockStore(s.id, reason);
      toast.success('Entidade bloqueada com sucesso.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao bloquear.');
    }
  };

  const unblock = async (s: AdminSindicato) => {
    try {
      await api.adminUnblockStore(s.id);
      toast.success('Entidade liberada com sucesso.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao liberar.');
    }
  };

  const remove = async (s: AdminSindicato) => {
    if (
      !confirm(
        `Excluir definitivamente o sindicato/associação "${s.displayName}" e TODOS os seus comunicados? Esta ação não pode ser desfeita.`
      )
    )
      return;
    try {
      await api.adminDeleteStore(s.id);
      toast.success('Entidade excluída.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary-900">Sindicatos & Associações</h1>
            {totalCount !== null && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800">
                {totalCount} cadastrados
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie entidades representativas, sindicatos e cooperativas de condutores de vans escolares no Brasil.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <input
          type="text"
          placeholder="Buscar por entidade, cidade ou e-mail..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-sm w-72 focus:ring-2 focus:ring-primary outline-none"
        />
        <select
          value={blockedFilter}
          onChange={(e) => {
            setBlockedFilter(e.target.value as '' | 'true' | 'false');
            setPage(1);
          }}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="">Todos os status</option>
          <option value="false">Ativos</option>
          <option value="true">Bloqueados</option>
        </select>
        {(searchInput || blockedFilter) && (
          <button
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setBlockedFilter('');
              setPage(1);
            }}
            className="text-xs text-gray-500 hover:text-gray-800 underline px-2 py-1"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando entidades…</p>
      ) : sindicatos.length === 0 ? (
        <p className="text-gray-600">Nenhum sindicato ou associação encontrada.</p>
      ) : (
        <div className="space-y-3">
          {sindicatos.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/sindicatos/${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary-900 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{s.displayName}</span>
                    <span className="text-xs text-gray-400">↗</span>
                  </Link>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🏛️ Entidade
                  </span>
                  {s.isBlocked ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Bloqueada
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Ativa
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-x-3 gap-y-1">
                  {s.city ? (
                    <span>
                      📍 <strong>{s.city.name}</strong>
                      {s.city.state?.uf ? `/${s.city.state.uf}` : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">📍 Sem cidade vinculada</span>
                  )}

                  {s.phone && <span>📞 {s.phone}</span>}

                  {s.whatsapp && (
                    <a
                      href={`https://wa.me/55${s.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      💬 WhatsApp: {s.whatsapp}
                    </a>
                  )}

                  {s.user?.email && (
                    <span className="text-gray-600">
                      ✉️ Login: <code className="text-xs bg-gray-50 px-1 py-0.5 rounded">{s.user.email}</code>
                    </span>
                  )}

                  <span className="text-gray-600">
                    📢 {s._count?.products ?? 0} comunicado(s)
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link
                  href={`/sindicatos/${s.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Ver página
                </Link>
                {s.isBlocked ? (
                  <button
                    onClick={() => unblock(s)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition"
                  >
                    Liberar
                  </button>
                ) : (
                  <button
                    onClick={() => block(s)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    Bloquear
                  </button>
                )}
                <button
                  onClick={() => remove(s)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
