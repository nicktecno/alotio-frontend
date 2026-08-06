'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api, assetUrl } from '@/lib/api';
import type { Product, ProductStatus, StoreType } from '@/types';

type AdminProduct = Product & {
  store: { id: string; displayName: string; slug: string; type: StoreType };
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  BLOCKED: 'Bloqueado',
};
const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-gray-100 text-gray-600',
  BLOCKED: 'bg-red-100 text-red-700',
};

function formatPrice(cents: number | null): string {
  if (cents == null) return 'Sob consulta';
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

export default function AdminAnunciosPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '30' };
      if (status) params.status = status;
      const res = await api.adminListProducts(params);
      setProducts(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const block = async (p: AdminProduct) => {
    const reason = prompt(`Bloquear "${p.title}". Motivo:`);
    if (reason === null) return;
    try {
      await api.adminBlockProduct(p.id, reason);
      toast.success('Anúncio bloqueado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro.');
    }
  };

  const unblock = async (p: AdminProduct) => {
    try {
      await api.adminUnblockProduct(p.id);
      toast.success('Anúncio liberado.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro.');
    }
  };

  const remove = async (p: AdminProduct) => {
    if (!confirm(`Excluir definitivamente o anúncio "${p.title}"? Esta ação não pode ser desfeita.`))
      return;
    try {
      await api.adminDeleteProduct(p.id);
      toast.success('Anúncio excluído.');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-900 mb-6">Anúncios</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['', 'ACTIVE', 'PAUSED', 'BLOCKED'] as const).map((s) => (
          <button
            key={s || 'all'}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              status === s
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'Todos' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">Nenhum anúncio.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-start gap-4"
            >
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                {p.images[0] ? (
                  <img
                    src={assetUrl(p.images[0].url) ?? ''}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-300">
                    {p.store.type === 'VAN' ? '🚐' : '🔧'}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-primary-900">{p.title}</h3>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{formatPrice(p.priceCents)}</p>
                <Link
                  href={`/lojas/${p.store.slug}`}
                  className="text-xs text-primary hover:underline"
                >
                  {p.store.displayName}
                </Link>
                {p.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {p.description}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {p.status === 'BLOCKED' ? (
                  <button
                    onClick={() => unblock(p)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition"
                  >
                    Liberar
                  </button>
                ) : (
                  <button
                    onClick={() => block(p)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    Bloquear
                  </button>
                )}
                <button
                  onClick={() => remove(p)}
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
