'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api, assetUrl } from '@/lib/api';
import { compressImage } from '@/lib/compressImage';
import type { City, State, Store, StoreType } from '@/types';

export default function LojaSettingsPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    displayName: '',
    type: 'VAN' as StoreType,
    phone: '',
    whatsapp: '',
    email: '',
    bio: '',
    cityId: '',
  });

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [stateId, setStateId] = useState('');
  const [pickCityId, setPickCityId] = useState('');
  const [serviceCities, setServiceCities] = useState<
    { id: string; name: string; uf: string }[]
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        api.getMyStore(),
        api.getStates() as Promise<State[]>,
      ]);
      setStates(st);
      if (res.store) {
        setStore(res.store);
        setForm({
          displayName: res.store.displayName,
          type: res.store.type,
          phone: res.store.phone ?? '',
          whatsapp: res.store.whatsapp ?? '',
          email: res.store.email ?? '',
          bio: res.store.bio ?? '',
          cityId: res.store.cityId ?? '',
        });
        setServiceCities(
          (res.store.serviceCities ?? []).map((sc) => ({
            id: sc.city.id,
            name: sc.city.name,
            uf: sc.city.state?.uf ?? '',
          })),
        );
      }
    } catch {
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!stateId) {
      setCities([]);
      return;
    }
    api
      .getCities(stateId)
      .then((c) => setCities(c as City[]))
      .catch(() => setCities([]));
  }, [stateId]);

  const addServiceCity = () => {
    if (!pickCityId) return;
    const city = cities.find((c) => c.id === pickCityId);
    if (!city) return;
    if (serviceCities.some((s) => s.id === city.id)) {
      toast('Essa cidade já foi adicionada.');
      return;
    }
    const uf = states.find((s) => s.id === stateId)?.uf ?? '';
    setServiceCities((prev) => [...prev, { id: city.id, name: city.name, uf }]);
    setPickCityId('');
  };

  const removeServiceCity = (id: string) => {
    setServiceCities((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateMyStore({
        displayName: form.displayName.trim(),
        type: form.type,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        bio: form.bio.trim(),
        cityIds: serviceCities.map((c) => c.id),
      });
      setStore(updated);
      toast.success('Dados salvos!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = async (file: File) => {
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('logo', compressed);
      const res = await api.uploadStoreLogo(fd);
      setStore((s) => (s ? { ...s, logoUrl: res.logoUrl } : s));
      toast.success('Logo atualizada!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar logo.');
    }
  };

  if (loading) return <p className="text-gray-500">Carregando…</p>;

  if (!store) {
    return (
      <p className="text-gray-600">
        Você ainda não tem uma loja. Volte à{' '}
        <a href="/lojista" className="text-primary underline">
          Visão Geral
        </a>{' '}
        para criar.
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">
        {store.type === 'ESCOLA' ? 'Perfil da escola' : 'Minha Loja'}
      </h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
          {store.logoUrl ? (
            <img
              src={assetUrl(store.logoUrl) ?? ''}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">🏪</span>
          )}
        </div>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Enviar logo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleLogo(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {store.type === 'ESCOLA' ? 'Nome da escola' : 'Nome da loja'}
          </label>
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as StoreType })
            }
            className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="VAN">Vans / veículos</option>
            <option value="PECAS">Peças e acessórios</option>
            <option value="ESCOLA">Escola parceira</option>
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail de contato
          </label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regiões atendidas (cidades)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Adicione as cidades onde você atende. É por elas que os clientes
            filtram sua loja por estado e cidade.
          </p>
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
            <select
              value={stateId}
              onChange={(e) => {
                setStateId(e.target.value);
                setPickCityId('');
              }}
              className="bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Estado…</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={pickCityId}
              onChange={(e) => setPickCityId(e.target.value)}
              disabled={!stateId}
              className="bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
            >
              <option value="">Cidade…</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addServiceCity}
              disabled={!pickCityId}
              className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-60"
            >
              Adicionar
            </button>
          </div>

          {serviceCities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {serviceCities.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 border border-primary-200 rounded-full px-3 py-1 text-sm"
                >
                  {c.name}
                  {c.uf ? `/${c.uf}` : ''}
                  <button
                    type="button"
                    onClick={() => removeServiceCity(c.id)}
                    className="text-primary-400 hover:text-red-500"
                    aria-label={`Remover ${c.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold transition disabled:opacity-60"
        >
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  );
}
