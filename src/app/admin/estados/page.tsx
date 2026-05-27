'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { State } from '@/types';
import Loading from '@/components/Loading';

export default function AdminEstadosPage() {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', uf: '' });
  const [saving, setSaving] = useState(false);
  const [cacheConfigured, setCacheConfigured] = useState<boolean | null>(null);
  const [cacheIndefinite, setCacheIndefinite] = useState(true);
  const [invalidatingId, setInvalidatingId] = useState<string | null>(null);
  const [invalidatingAll, setInvalidatingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, cacheStatus] = await Promise.all([
        api.getStates(),
        api.adminSearchCacheStatus().catch(() => null),
      ]);
      setStates(data as State[]);
      setCacheConfigured(cacheStatus?.configured ?? false);
      setCacheIndefinite(cacheStatus?.indefiniteTtl ?? true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.adminCreateState({ name: form.name, uf: form.uf.toUpperCase() });
      toast.success('Estado criado!');
      setForm({ name: '', uf: '' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este estado?')) return;
    try {
      await api.adminDeleteState(id);
      toast.success('Estado deletado');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleInvalidateCache = async (state: State) => {
    if (
      !confirm(
        `Invalidar o cache de busca de transportadores em ${state.name} (${state.uf})? A próxima busca recarrega do banco.`,
      )
    ) {
      return;
    }
    setInvalidatingId(state.id);
    try {
      const res = await api.adminInvalidateSearchCache(state.id);
      toast.success(res.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao invalidar cache');
    } finally {
      setInvalidatingId(null);
    }
  };

  const handleInvalidateAllScope = async () => {
    if (
      !confirm(
        'Invalidar cache de buscas sem filtro de estado (escopo global)?',
      )
    ) {
      return;
    }
    setInvalidatingAll(true);
    try {
      const res = await api.adminInvalidateSearchCacheAllScope();
      toast.success(res.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setInvalidatingAll(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estados</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {showForm ? 'Cancelar' : '+ Novo Estado'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 text-sm text-gray-600">
        <h2 className="font-semibold text-gray-900 mb-1">Cache da busca pública</h2>
        {cacheConfigured === null ? (
          <p>Carregando status do cache…</p>
        ) : cacheConfigured ? (
          <p>
            Redis ativo. TTL{' '}
            {cacheIndefinite
              ? 'indeterminado — entradas só mudam ao invalidar ou ao cadastrar transportador no estado.'
              : 'com expiração configurada no servidor.'}
          </p>
        ) : (
          <p className="text-amber-700">
            Cache desativado (Upstash não configurado). Invalidação manual não se aplica.
          </p>
        )}
        {cacheConfigured && (
          <button
            type="button"
            onClick={handleInvalidateAllScope}
            disabled={invalidatingAll}
            className="mt-3 text-primary font-medium hover:underline disabled:opacity-50"
          >
            {invalidatingAll ? 'Invalidando…' : 'Invalidar cache global (busca sem UF)'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome do estado"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
            <input
              value={form.uf}
              onChange={(e) => setForm({ ...form, uf: e.target.value })}
              placeholder="UF (ex: SP)"
              required
              maxLength={2}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none uppercase"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
            >
              {saving ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">UF</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ativo</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {states.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.uf}</td>
                  <td className="px-4 py-3">
                    <span className={s.isActive ? 'text-green-600' : 'text-red-500'}>
                      {s.isActive ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    {cacheConfigured && (
                      <button
                        type="button"
                        onClick={() => handleInvalidateCache(s)}
                        disabled={invalidatingId === s.id}
                        className="text-primary hover:text-primary-800 text-xs font-medium disabled:opacity-50"
                      >
                        {invalidatingId === s.id ? 'Invalidando…' : 'Invalidar cache'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
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
