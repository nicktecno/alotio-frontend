'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Store, StorePlan, StoreType } from '@/types';

type AdminStore = Store & {
  user?: { email: string };
  _count?: { products: number };
};

export default function AdminLojasPage() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<StoreType | ''>('');
  const [plan, setPlan] = useState<StorePlan | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '30' };
      if (type) {
        params.type = type;
      } else {
        params.excludeType = 'SINDICATO';
      }
      if (plan) params.plan = plan;
      if (search) params.search = search;
      const res = await api.adminListStores(params);
      setStores(res.data as AdminStore[]);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, [type, plan, search, page]);

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

  const block = async (s: AdminStore) => {
    const reason = prompt(`Bloquear a loja "${s.displayName}". Motivo:`);
    if (reason === null) return;
    try {
      await api.adminBlockStore(s.id, reason);
      toast.success('Loja bloqueada.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro.');
    }
  };

  const unblock = async (s: AdminStore) => {
    try {
      await api.adminUnblockStore(s.id);
      toast.success('Loja liberada.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro.');
    }
  };

  const remove = async (s: AdminStore) => {
    if (!confirm(`Excluir definitivamente a loja "${s.displayName}" e TODOS os seus anúncios? Esta ação não pode ser desfeita.`))
      return;
    try {
      await api.adminDeleteStore(s.id);
      toast.success('Loja excluída.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Lojas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie concessionárias, lojas de autopeças e parceiros comerciais.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-sm w-64"
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as StoreType | '');
            setPage(1);
          }}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
        >
          <option value="">Todas as lojas</option>
          <option value="VAN">🚐 Vans e veículos</option>
          <option value="PECAS">🔧 Peças e acessórios</option>
          <option value="ESCOLA">🏫 Escolas parceiras</option>
        </select>
        <select
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value as StorePlan | '');
            setPage(1);
          }}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
        >
          <option value="">Todos os planos</option>
          <option value="FREE">Gratuito</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-600">Nenhuma loja encontrada.</p>
      ) : (
        <div className="space-y-3">
          {stores.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={s.type === 'ESCOLA' ? `/escolas-parceiras/${s.slug}` : `/lojas/${s.slug}`}
                    className="font-semibold text-primary-900 hover:underline"
                  >
                    {s.displayName}
                  </Link>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      s.plan === 'PREMIUM'
                        ? 'bg-secondary/20 text-secondary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {s.plan === 'PREMIUM' ? 'Premium' : 'Gratuito'}
                  </span>
                  {s.isBlocked && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Bloqueada
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">
                    {s.type === 'VAN' ? '🚐 Vans' : s.type === 'PECAS' ? '🔧 Peças' : '🏫 Escola parceira'}
                  </span>
                  {s.city ? ` · ${s.city.name}${s.city.state?.uf ? `/${s.city.state.uf}` : ''}` : ''}
                  {` · ${s._count?.products ?? 0} anúncio(s)`}
                  {s.user?.email ? ` · ${s.user.email}` : ''}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
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
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
