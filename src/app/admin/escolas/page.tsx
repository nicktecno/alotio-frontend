'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  type School,
  type City,
  type State,
  type Paginated,
  ADMIN_LIST_PAGE_SIZE,
} from '@/types';
import Loading from '@/components/Loading';
import AdminPagination from '@/components/AdminPagination';

export default function AdminEscolasPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'MUNICIPAL', cityId: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', type: '' });

  useEffect(() => {
    api.getStates().then((data) => setStates(data as State[]));
  }, []);

  useEffect(() => {
    if (filterState) {
      api.getCities(filterState).then((data) => setCities(data as City[]));
      setFilterCity('');
    } else {
      setCities([]);
    }
  }, [filterState]);

  useEffect(() => {
    setPage(1);
  }, [filterState, filterCity]);

  const load = async () => {
    setLoading(true);
    const data = (await api.getSchools(
      filterCity || undefined,
      undefined,
      undefined,
      { page, limit: ADMIN_LIST_PAGE_SIZE },
    )) as Paginated<School>;
    setSchools(data.data);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filterCity, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.adminCreateSchool(form);
      toast.success('Escola criada!');
      setForm({ name: '', type: 'MUNICIPAL', cityId: '', address: '' });
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
      await api.adminUpdateSchool(id, editForm);
      toast.success('Escola atualizada!');
      setEditingId(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar esta escola?')) return;
    try {
      await api.adminDeleteSchool(id);
      toast.success('Escola deletada');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Escolas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {showForm ? 'Cancelar' : '+ Nova Escola'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome da escola"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="MUNICIPAL">Municipal</option>
              <option value="ESTADUAL">Estadual</option>
              <option value="PARTICULAR">Particular</option>
              <option value="FEDERAL">Federal</option>
            </select>
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
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Endereço (opcional)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            {saving ? 'Criando...' : 'Criar Escola'}
          </button>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ativa</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schools.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {editingId === s.id ? (
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm w-full focus:ring-2 focus:ring-primary outline-none"
                      />
                    ) : s.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {editingId === s.id ? (
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="MUNICIPAL">Municipal</option>
                        <option value="ESTADUAL">Estadual</option>
                        <option value="PARTICULAR">Particular</option>
                        <option value="FEDERAL">Federal</option>
                      </select>
                    ) : s.type}
                  </td>
                  <td className="px-4 py-3">
                    <span className={s.isActive ? 'text-green-600' : 'text-red-500'}>
                      {s.isActive ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {editingId === s.id ? (
                      <>
                        <button onClick={() => handleUpdate(s.id)} className="text-green-600 hover:text-green-700 text-xs font-medium">Salvar</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 text-xs font-medium">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(s.id); setEditForm({ name: s.name, type: s.type }); }}
                          className="text-primary hover:text-primary-600 text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Deletar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={ADMIN_LIST_PAGE_SIZE}
            onPageChange={setPage}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
