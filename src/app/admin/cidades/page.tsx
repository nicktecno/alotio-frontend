'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { City, State } from '@/types';
import Loading from '@/components/Loading';

export default function AdminCidadesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filterState, setFilterState] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', stateId: '', phonePrefix: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getStates().then((data) => setStates(data as State[]));
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await api.getCities(filterState || undefined);
    setCities(data as City[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterState]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.adminCreateCity(form);
      toast.success('Cidade criada!');
      setForm({ name: '', stateId: '', phonePrefix: '' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar esta cidade?')) return;
    try {
      await api.adminDeleteCity(id);
      toast.success('Cidade deletada');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cidades</h1>
        <div className="flex gap-3">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">Todos os estados</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.uf}</option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {showForm ? 'Cancelar' : '+ Nova Cidade'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome da cidade"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <select
              value={form.stateId}
              onChange={(e) => setForm({ ...form, stateId: e.target.value })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Estado</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input
              value={form.phonePrefix}
              onChange={(e) => setForm({ ...form, phonePrefix: e.target.value })}
              placeholder="DDD (013)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cities.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.state?.uf || '-'}</td>
                  <td className="px-4 py-3 text-gray-400">{c.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
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
