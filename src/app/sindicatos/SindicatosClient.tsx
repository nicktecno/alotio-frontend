'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, assetUrl } from '@/lib/api';
import type { Store } from '@/types';
import {
  SINDICATOS_LIST,
  findSindicatoByIdOrSlug,
  type SindicatoContactItem,
} from '@/data/sindicatos-list';

function getStoreUf(store: Store): string {
  if (store.city?.state?.uf) return store.city.state.uf.trim().toUpperCase();
  const matched = findSindicatoByIdOrSlug(store.slug);
  if (matched?.uf) return matched.uf.trim().toUpperCase();
  return '';
}

function getStoreCity(store: Store): string {
  if (store.city?.name) return store.city.name;
  const matched = findSindicatoByIdOrSlug(store.slug);
  return matched?.cidade || '';
}

export default function SindicatosClient() {
  const searchParams = useSearchParams();
  const initialUf = searchParams?.get('uf')?.trim().toUpperCase() || 'ALL';

  const [platformStores, setPlatformStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUf, setSelectedUf] = useState<string>(initialUf);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync state if URL query param changes
  useEffect(() => {
    const paramUf = searchParams?.get('uf')?.trim().toUpperCase();
    if (paramUf) setSelectedUf(paramUf);
  }, [searchParams]);

  // Load registered stores from DB
  useEffect(() => {
    api
      .marketplaceListStores({ type: 'SINDICATO', limit: '48' })
      .then((response) => setPlatformStores(response.data))
      .catch(() => setPlatformStores([]))
      .finally(() => setLoading(false));
  }, []);

  // UF counts & sorted list of available UFs
  const { availableUfs, ufCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    SINDICATOS_LIST.forEach((s) => {
      const uf = (s.uf || '').trim().toUpperCase();
      if (uf) {
        counts[uf] = (counts[uf] || 0) + 1;
      }
    });
    const ufs = Object.keys(counts).sort();
    return { availableUfs: ufs, ufCounts: counts };
  }, []);

  // Filtered platform stores (Credenciadas) strictly matching selected state and search query
  const filteredPlatformStores = useMemo(() => {
    return platformStores.filter((store) => {
      const storeUf = getStoreUf(store);
      if (selectedUf !== 'ALL' && storeUf !== selectedUf) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (store.displayName || '').toLowerCase().includes(q);
        const matchCity = getStoreCity(store).toLowerCase().includes(q);
        if (!matchName && !matchCity) return false;
      }
      return true;
    });
  }, [platformStores, selectedUf, searchQuery]);

  // Filtered catalog items strictly matching selected state and search query
  const filteredSindicatos = useMemo(() => {
    return SINDICATOS_LIST.filter((s) => {
      const sUf = (s.uf || '').trim().toUpperCase();
      if (selectedUf !== 'ALL' && sUf !== selectedUf) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (s.nome || '').toLowerCase().includes(q);
        const matchSigla = (s.sigla || '').toLowerCase().includes(q);
        const matchCity = (s.cidade || '').toLowerCase().includes(q);
        if (!matchName && !matchSigla && !matchCity) return false;
      }
      return true;
    });
  }, [selectedUf, searchQuery]);

  const handleSelectUf = (uf: string) => {
    setSelectedUf(uf);
    if (typeof window !== 'undefined') {
      const el = document.getElementById('sindicatos-directory');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-r from-emerald-800 to-teal-900 py-12 sm:py-16 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-3xl">
                <span className="inline-block bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  🏛️ Rede Nacional de Entidades
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
                  Sindicatos e Associações de Transporte Escolar
                </h1>
                <p className="text-emerald-100 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
                  Conheça os sindicatos, associações e cooperativas que representam os condutores de vans e veículos escolares legalizados em cada cidade do Brasil.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
                <Link
                  href="/cadastro-sindicato"
                  className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-6 py-3.5 rounded-xl font-extrabold text-center shadow-lg transition text-sm"
                >
                  Cadastrar minha Entidade
                </Link>
                <Link
                  href="/tios"
                  className="bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-600/50 px-6 py-3 rounded-xl font-bold text-center transition text-sm"
                >
                  Buscar Vans Escolares
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT & DIRECTORY */}
        <section id="sindicatos-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="w-full sm:w-96 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, sigla ou cidade…"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 font-medium">
                {selectedUf === 'ALL' ? (
                  <span>Exibindo todas as <strong>{filteredSindicatos.length}</strong> entidades no Brasil</span>
                ) : (
                  <span>
                    Exibindo <strong>{filteredSindicatos.length}</strong> {filteredSindicatos.length === 1 ? 'entidade' : 'entidades'} em <strong>{selectedUf}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* HORIZONTAL UF PILLS BAR */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => handleSelectUf('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  selectedUf === 'ALL'
                    ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>Todos</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    selectedUf === 'ALL' ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {SINDICATOS_LIST.length}
                </span>
              </button>

              {availableUfs.map((uf) => {
                const count = ufCounts[uf] || 0;
                const isSelected = selectedUf === uf;
                return (
                  <button
                    key={uf}
                    type="button"
                    onClick={() => handleSelectUf(uf)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{uf}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ACTIVE FILTER CHIP / RESET BAR */}
            {(selectedUf !== 'ALL' || searchQuery.trim()) && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📍</span>
                  <span>
                    {selectedUf !== 'ALL' && (
                      <>
                        Estado: <strong className="bg-emerald-700 text-white px-2 py-0.5 rounded text-xs font-black">{selectedUf}</strong>
                        {searchQuery.trim() ? ' • ' : ''}
                      </>
                    )}
                    {searchQuery.trim() && (
                      <>Busca: &ldquo;<strong>{searchQuery}</strong>&rdquo;</>
                    )}
                    {' '}({filteredSindicatos.length} {filteredSindicatos.length === 1 ? 'entidade' : 'entidades'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUf('ALL');
                    setSearchQuery('');
                  }}
                  className="bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>✕</span>
                  <span>Limpar filtros</span>
                </button>
              </div>
            )}
          </div>

          {/* REGISTERED STORES (IF ANY MATCHING FILTER) */}
          {filteredPlatformStores.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>⭐</span>
                <span>
                  Entidades Credenciadas no Alô Tio
                  {selectedUf !== 'ALL' && ` em ${selectedUf}`} ({filteredPlatformStores.length})
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPlatformStores.map((store) => {
                  const storeUf = getStoreUf(store);
                  const storeCity = getStoreCity(store);
                  return (
                    <Link
                      key={store.id}
                      href={`/sindicatos/${store.slug}`}
                      className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 hover:shadow-lg transition relative overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex gap-4 items-center mb-3">
                          <div className="w-14 h-14 rounded-xl bg-emerald-50 overflow-hidden flex items-center justify-center shrink-0 border border-emerald-100">
                            {store.logoUrl ? (
                              <img
                                src={assetUrl(store.logoUrl) ?? ''}
                                alt={store.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl">🏛️</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-700 transition truncate">
                              {store.displayName}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {storeCity ? `${storeCity} (${storeUf})` : 'Entidade Parceira'}
                            </p>
                            <span className="inline-block mt-1 text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                              ⭐ Perfil Oficial Ativo
                            </span>
                          </div>
                        </div>
                        {store.bio && (
                          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                            {store.bio}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform inline-block">
                          Ver página completa →
                        </span>
                        {store.whatsapp && (
                          <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                            <span className="text-green-500">●</span> WhatsApp Ativo
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN DIRECTORY GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>🏛️</span>
                <span>
                  Guia Nacional de Sindicatos e Associações
                  {selectedUf !== 'ALL' && ` em ${selectedUf}`} ({filteredSindicatos.length})
                </span>
              </h2>
            </div>

            {filteredSindicatos.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 text-gray-500 space-y-3">
                <span className="text-4xl block">🔍</span>
                <p className="font-bold text-gray-800 text-base">
                  Nenhum sindicato ou associação encontrado para este filtro.
                </p>
                <p className="text-xs text-gray-500">
                  Tente alterar o estado selecionado ou limpar o termo digitado na busca.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUf('ALL');
                    setSearchQuery('');
                  }}
                  className="bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition hover:bg-emerald-800 inline-block mt-2"
                >
                  Ver todos os estados ({SINDICATOS_LIST.length})
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSindicatos.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white border border-gray-200 hover:border-emerald-400 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between group relative"
                  >
                    <Link href={`/sindicatos/${s.id}`} prefetch={false} className="block">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          {s.tipo ? s.tipo.toUpperCase() : 'SINDICATO'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (s.uf) handleSelectUf(s.uf.trim().toUpperCase());
                          }}
                          title={`Filtrar apenas ${s.uf}`}
                          className={`text-xs font-black px-2.5 py-0.5 rounded-md transition ${
                            selectedUf === s.uf
                              ? 'bg-emerald-700 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-800'
                          }`}
                        >
                          {s.uf}
                        </button>
                      </div>

                      <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-700 transition leading-snug">
                        {s.nome}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {s.cidade} ({s.uf})
                      </p>

                      {s.observacoes && (
                        <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          {s.observacoes}
                        </p>
                      )}
                    </Link>

                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/sindicatos/${s.id}`}
                        prefetch={false}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
                      >
                        <span>Ver detalhes</span>
                        <span>→</span>
                      </Link>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {s.telefoneValido && (
                          <a
                            href={`https://wa.me/55${s.telefoneRaw?.replace(/\D/g, '') || s.telefone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá! Vi o contato da ${s.sigla || s.nome} no portal Alô Tio.`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {s.website && (
                          <a
                            href={s.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                            title="Site Oficial"
                          >
                            🌐
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTTOM CTA */}
          <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-200 text-center max-w-3xl mx-auto space-y-4">
            <span className="text-3xl block">🤝</span>
            <h3 className="text-2xl font-bold text-emerald-950 font-heading">
              Sua entidade ainda não está cadastrada?
            </h3>
            <p className="text-emerald-800 text-sm max-w-xl mx-auto leading-relaxed">
              O cadastro de sindicatos e associações no Alô Tio é 100% gratuito. Crie a página oficial da sua organização e fortaleça os transportadores da sua região.
            </p>
            <div className="pt-2">
              <Link
                href="/cadastro-sindicato"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition inline-block text-sm"
              >
                Cadastrar Sindicato ou Associação Gratuitamente →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
