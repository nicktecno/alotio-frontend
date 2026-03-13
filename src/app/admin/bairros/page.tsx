'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Neighborhood, City, State } from '@/types';
import Loading from '@/components/Loading';

export default function AdminBairrosPage() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', cityId: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    api.getStates().then((data) => setStates(data as State[]));
  }, []);

  useEffect(() => {
    if (filterState) {
      api.getCities(filterState).then((data) => setCities(data as City[]));
      setFilterCity('');
    }
  }, [filterState]);

  const load = async () => {
    setLoading(true);
    const data = await api.getNeighborhoods(filterCity || undefined);
    setNeighborhoods(data as Neighborhood[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterCity]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.adminCreateNeighborhood(form);
      toast.success('Bairro criado!');
      setForm({ name: '', cityId: '' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.adminUpdateNeighborhood(id, { name: editName });
      toast.success('Bairro atualizado!');
      setEditingId(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este bairro?')) return;
    try {
      await api.adminDeleteNeighborhood(id);
      toast.success('Bairro deletado');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bairros</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {showForm ? 'Cancelar' : '+ Novo Bairro'}
        </button>
      </div>

      <div className="flex gap-3 mb-4">
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
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          disabled={!filterState}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
        >
          <option value="">Todas as cidades</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome do bairro"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <select
              value={form.cityId}
              onChange={(e) => setForm({ ...form, cityId: e.target.value })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Cidade</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {neighborhoods.map((nb) => (
                <tr key={nb.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {editingId === nb.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(nb.id); }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm w-full focus:ring-2 focus:ring-primary outline-none"
                      />
                    ) : nb.name}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {editingId === nb.id ? (
                      <>
                        <button onClick={() => handleUpdate(nb.id)} className="text-green-600 hover:text-green-700 text-xs font-medium">Salvar</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 text-xs font-medium">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(nb.id); setEditName(nb.name); }}
                          className="text-primary hover:text-primary-600 text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button onClick={() => handleDelete(nb.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Deletar</button>
                      </>
                    )}
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
