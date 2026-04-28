'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MdMyLocation } from 'react-icons/md';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, assetUrl, ApiError } from '@/lib/api';
import { useStates, useCities, useSchools, useNeighborhoods } from '@/lib/swr';
import type { TioPublicView, PaginatedResponse } from '@/types';
import Loading from '@/components/Loading';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

export default function TiosPage() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [searchName, setSearchName] = useState('');
  const [tios, setTios] = useState<TioPublicView[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [locatingGeo, setLocatingGeo] = useState(false);
  const [pendingCityId, setPendingCityId] = useState<string | null>(null);
  const pendingCityIdRef = useRef<string | null>(null);
  pendingCityIdRef.current = pendingCityId;

  const { data: states = [], isLoading: loadingStates } = useStates(true);
  const { data: cities = [], isLoading: loadingCities } = useCities(selectedState || undefined, true);
  const { data: schools = [], isLoading: loadingSchoolsData } = useSchools(
    selectedCity || undefined,
    undefined,
    true,
  );
  const { data: neighborhoods = [], isLoading: loadingNeighborhoods } = useNeighborhoods(
    selectedCity || undefined,
  );
  const loadingSchools = loadingSchoolsData || loadingNeighborhoods;

  const handleStateChange = (value: string) => {
    setPendingCityId(null);
    setSelectedState(value);
    setSelectedCity('');
    setSelectedSchool('');
    setSelectedNeighborhood('');
    setTios([]);
    setHasSearched(false);
    setPage(1);
  };

  const handleCityChange = (value: string) => {
    setPendingCityId(null);
    setSelectedCity(value);
    setSelectedSchool('');
    setSelectedNeighborhood('');
    setTios([]);
    setHasSearched(false);
    setPage(1);
  };

  const handleSchoolChange = (value: string) => {
    setSelectedSchool(value);
    setSelectedNeighborhood('');
    setPage(1);
    if (!value) {
      setTios([]);
      setHasSearched(false);
    }
  };

  const search = useCallback(async () => {
    if (!selectedSchool) return;
    setLoading(true);
    setHasSearched(true);
    const params: Record<string, string> = { page: String(page), limit: '12' };
    if (selectedState) params.stateId = selectedState;
    if (selectedCity) params.cityId = selectedCity;
    params.schoolId = selectedSchool;
    if (selectedNeighborhood) params.neighborhoodId = selectedNeighborhood;
    if (searchName.trim()) params.name = searchName.trim();

    const res = (await api.searchTios(params)) as PaginatedResponse<TioPublicView>;
    setTios(res.data);
    setTotalPages(res.totalPages);
    setLoading(false);
  }, [page, selectedState, selectedCity, selectedSchool, selectedNeighborhood, searchName]);

  useEffect(() => {
    if (selectedSchool) {
      search();
    }
  }, [selectedSchool, selectedNeighborhood, page, search]);

  /** Após escolher o estado, aplica cidade vinda da geolocalização quando a lista SWR carregar. */
  useEffect(() => {
    const pending = pendingCityIdRef.current;
    if (!pending || !selectedState) return;
    if (loadingCities) return;
    const found = cities.find((c) => c.id === pending);
    if (found) {
      setSelectedCity(pending);
      setSelectedSchool('');
      setSelectedNeighborhood('');
      setTios([]);
      setHasSearched(false);
      setPage(1);
      setPendingCityId(null);
      toast.success(`${found.name} — escolha a escola abaixo.`);
      return;
    }
    if (cities.length > 0) {
      setPendingCityId(null);
      toast.error(
        'Não encontramos uma cidade com transportadores cadastrados que corresponda exatamente à sua posição. Escolha a cidade manualmente.',
      );
      return;
    }
    setPendingCityId(null);
    toast.error(
      'Nenhuma cidade com transportadores neste estado para combinar com o GPS. Escolha a cidade manualmente.',
    );
  }, [pendingCityId, selectedState, cities, loadingCities]);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Seu navegador não suporta localização.');
      return;
    }
    setLocatingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await api.resolveCityFromLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            true,
          );
          setPendingCityId(null);
          setSelectedState(res.stateId);
          setSelectedCity('');
          setSelectedSchool('');
          setSelectedNeighborhood('');
          setTios([]);
          setHasSearched(false);
          setPage(1);
          if (res.cityId) {
            setPendingCityId(res.cityId);
          } else {
            toast(
              `${res.stateName}: não há cidade com transportadores cadastrados que corresponda à sua posição. Selecione a cidade na lista.`,
              { icon: '📍', duration: 5000 },
            );
          }
        } catch (e) {
          const msg =
            e instanceof ApiError
              ? e.message
              : 'Não foi possível usar a localização.';
          toast.error(msg);
        } finally {
          setLocatingGeo(false);
        }
      },
      (err: GeolocationPositionError) => {
        setLocatingGeo(false);
        if (err.code === 1) {
          toast.error('Permissão de localização negada.');
        } else if (err.code === 2) {
          toast.error('Posição indisponível. Tente de novo ou escolha manualmente.');
        } else if (err.code === 3) {
          toast.error('Tempo esgotado ao obter a localização.');
        } else {
          toast.error('Não foi possível obter a localização.');
        }
      },
      { enableHighAccuracy: true, timeout: 18_000, maximumAge: 120_000 },
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: siteUrl },
          { name: 'Buscar transporte escolar', url: `${siteUrl}/tios` },
        ]}
      />
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">Buscar Tios</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5 pb-5 border-b border-gray-100">
            <p className="text-sm text-gray-600 max-w-xl leading-relaxed">
              A localização preenche estado e cidade quando houver tios na região. Depois escolha a
              escola.
            </p>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locatingGeo || loadingStates}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {locatingGeo ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdMyLocation className="text-lg" aria-hidden />
              )}
              {locatingGeo ? 'Obtendo localização…' : 'Usar minha localização'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={loadingStates}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50 disabled:cursor-wait"
                >
                  <option value="">{loadingStates ? 'Carregando estados...' : 'Selecione o estado'}</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.uf})</option>
                  ))}
                </select>
                {loadingStates && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!selectedState || loadingCities}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50 disabled:cursor-wait"
                >
                  <option value="">{loadingCities ? 'Carregando cidades...' : 'Selecione a cidade'}</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {loadingCities && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
              <div className="relative">
                <select
                  value={selectedSchool}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  disabled={!selectedCity || loadingSchools}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50 disabled:cursor-wait"
                >
                  <option value="">{loadingSchools ? 'Carregando escolas...' : 'Selecione a escola'}</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {loadingSchools && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedSchool && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro (opcional)</label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => { setSelectedNeighborhood(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Todos os bairros</option>
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome (opcional)</label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); search(); } }}
                  placeholder="Filtrar por nome..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
          )}

          {!selectedSchool && selectedCity && schools.length === 0 && !loadingSchools && (
            <p className="text-sm text-gray-500 mt-4">
              Nenhuma escola com transportadores cadastrados nesta cidade.
            </p>
          )}
        </div>

        {/* Prompt */}
        {!hasSearched && !loading && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏫</div>
            <p className="text-gray-500 text-lg">Selecione uma escola para encontrar os transportadores.</p>
            <p className="text-gray-400 mt-2">Escolha o estado, cidade e escola acima.</p>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <Loading />
        ) : hasSearched && tios.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Nenhum transportador encontrado para esta escola.</p>
          </div>
        ) : tios.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tios.map((tio) => (
                <Link
                  key={tio.id}
                  href={`/tios/${tio.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                      {tio.avatarUrl ? (
                        <img
                          src={assetUrl(tio.avatarUrl)!}
                          alt={tio.displayName}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-primary font-bold">
                          {tio.displayName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition truncate">
                        {tio.displayName}
                      </h3>
                      <p className="text-sm text-gray-500">Prefixo {tio.prefixo}</p>
                      {tio.isIntermunicipal && tio.secondaryCity ? (
                        <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                          <div>{tio.city.name}/{tio.city.state.uf}</div>
                          <div className="text-gray-500">e {tio.secondaryCity.name}/{tio.secondaryCity.state.uf}</div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mt-1">
                          {tio.city.name}/{tio.city.state.uf}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1 shrink-0">
                      {tio.isPremium && (
                        <span className="bg-primary-50 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                          Premium
                        </span>
                      )}
                      {tio.isIntermunicipal && (
                        <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                          Intermunicipal
                        </span>
                      )}
                    </div>
                  </div>

                  {tio.vacancyTotal != null && tio.vacancyTotal > 0 && (
                    <p className="text-sm font-semibold text-secondary mb-2">
                      {tio.vacancyTotal} {tio.vacancyTotal === 1 ? 'vaga disponível' : 'vagas disponíveis'}
                    </p>
                  )}

                  {tio.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tio.bio}</p>
                  )}

                  {(tio.hasTV || tio.hasAC || tio.hasMonitor) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tio.hasTV && (
                        <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">📺 TV</span>
                      )}
                      {tio.hasAC && (
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">❄️ AC</span>
                      )}
                      {tio.hasMonitor && (
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">👀 Monitor</span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {tio.schools.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                      >
                        {s.name}
                      </span>
                    ))}
                    {tio.schools.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{tio.schools.length - 3} escolas
                      </span>
                    )}
                  </div>

                  {tio.neighborhoods.length > 0 && (() => {
                    const grouped = tio.neighborhoods.reduce<Record<string, typeof tio.neighborhoods>>((acc, n) => {
                      const key = n.cityName || tio.city.name;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(n);
                      return acc;
                    }, {});
                    const entries = Object.entries(grouped);
                    return (
                      <div className="mt-2 space-y-1">
                        {entries.map(([cityName, nbs]) => (
                          <div key={cityName} className="flex flex-wrap gap-1.5 items-center">
                            {entries.length > 1 && (
                              <span className="text-xs text-gray-400 font-medium">{cityName}:</span>
                            )}
                            {nbs.slice(0, 3).map((n) => (
                              <span key={n.id} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                                {n.name}
                              </span>
                            ))}
                            {nbs.length > 3 && (
                              <span className="text-xs text-gray-400">+{nbs.length - 3}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-gray-600">
                  {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
