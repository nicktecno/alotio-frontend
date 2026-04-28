'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';

type Row = {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  punctuality: number;
  communication: number;
  safety: number;
  comment: string;
  createdAt: string;
  profile: { id: string; displayName: string; prefixo: string };
};

export default function AdminAvaliacoesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminListPendingReviews(1);
      setRows(res.data);
      setTotal(res.total);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string) => {
    setActing(id);
    try {
      await api.adminApproveReview(id);
      toast.success('Avaliação aprovada.');
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro');
    } finally {
      setActing(null);
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Reprovar esta avaliação? Ela não aparecerá publicamente.')) return;
    setActing(id);
    try {
      await api.adminRejectReview(id);
      toast.success('Avaliação reprovada.');
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro');
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">Avaliações pendentes</h1>
      <p className="text-sm text-gray-500 mb-6">
        {total === 0
          ? 'Nenhuma avaliação aguardando moderação.'
          : `${total} avaliação(ões) na fila.`}
      </p>

      <div className="space-y-4">
        {rows.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {r.profile.displayName}{' '}
                  <span className="text-gray-500 font-normal">· prefixo {r.profile.prefixo}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {r.reviewerName} — {r.reviewerEmail}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={acting === r.id}
                  onClick={() => approve(r.id)}
                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  disabled={acting === r.id}
                  onClick={() => reject(r.id)}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                >
                  Reprovar
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-2">
              {new Date(r.createdAt).toLocaleString('pt-BR')} · P{r.punctuality} C{r.communication} S
              {r.safety}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap border-t border-gray-100 pt-2">
              {r.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
