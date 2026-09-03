'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, assetUrl } from '@/lib/api';
import type { City, State, Store, StoreType } from '@/types';

function regionsLabel(store: Store): string {
  const names = (store.serviceCities ?? []).map(
    (sc) => `${sc.city.name}${sc.city.state?.uf ? `/${sc.city.state.uf}` : ''}`,
  );
  if (names.length === 0) return store.city ? store.city.name : '';
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

function StoreCard({ store }: { store: Store }) {
  const premium = store.plan === 'PREMIUM';
  const regions = regionsLabel(store);
  return (
    <Link
      href={`/lojas/${store.slug}`}
      className={`block rounded-xl p-5 border transition hover:shadow-md ${
        premium
          ? 'border-secondary-300 bg-secondary-50 ring-1 ring-secondary-200'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
          {store.logoUrl ? (
            <img
              src={assetUrl(store.logoUrl) ?? ''}
              alt={store.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">{store.type === 'VAN' ? '🚐' : '🔧'}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-primary-900 truncate">
              {store.displayName}
            </h3>
            {premium && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-white">
                DESTAQUE
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {store.type === 'VAN' ? 'Vans e veículos' : 'Peças e acessórios'}
            {regions ? ` · ${regions}` : ''}
          </p>
          {typeof store._count?.products === 'number' && (
            <p className="text-xs text-gray-400 mt-0.5">
              {store._count.products} anúncio(s)
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function LojasClient() {
  const searchParams = useSearchParams();
  const initialType =
    searchParams.get('type') === 'VAN' || searchParams.get('type') === 'PECAS'
      ? (searchParams.get('type') as StoreType)
      : '';
  const [stores, setStores] = useState<Store[]>([]);
  const [featured, setFeatured] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<StoreType | ''>(initialType);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');

  useEffect(() => {
    api
      .marketplaceFeatured(6, { excludeType: 'ESCOLA' })
      .then(setFeatured)
      .catch(() => setFeatured([]));
    (api.getStates(true) as Promise<State[]>)
      .then(setStates)
      .catch(() => setStates([]));
  }, []);

  useEffect(() => {
    setCityId('');
    if (!stateId) {
      setCities([]);
      return;
    }
    api
      .getCities(stateId, true)
      .then((c) => setCities(c as City[]))
      .catch(() => setCities([]));
  }, [stateId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '24', excludeType: 'ESCOLA' };
      if (type) params.type = type;
      if (search) params.search = search;
      if (cityId) params.cityId = cityId;
      else if (stateId) params.stateId = stateId;
      const res = await api.marketplaceListStores(params);
      setStores(res.data);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [type, search, stateId, cityId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const hasFilter = !!(search || type || stateId || cityId);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <section className="bg-primary py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Lojas de vans e peças
            </h1>
            <p className="text-primary-100 mt-2">
              Anúncios de vans escolares e peças. Fale direto com o vendedor.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {featured.length > 0 && !hasFilter && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-primary-900 mb-4">
                ⭐ Lojas em destaque
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((s) => (
                  <StoreCard key={s.id} store={s} />
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar loja pelo nome…"
              className="flex-1 bg-white border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as StoreType | '')}
              className="bg-white border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Todos os tipos</option>
              <option value="VAN">Vans / veículos</option>
              <option value="PECAS">Peças e acessórios</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <select
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              className="flex-1 bg-white border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Todos os estados</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              disabled={!stateId}
              className="flex-1 bg-white border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
            >
              <option value="">Todas as cidades</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-gray-500">Carregando…</p>
          ) : stores.length === 0 ? (
            <p className="text-gray-600">Nenhuma loja encontrada.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((s) => (
                <StoreCard key={s.id} store={s} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
