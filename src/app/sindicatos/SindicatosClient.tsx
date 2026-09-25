'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, assetUrl } from '@/lib/api';
import type { Store } from '@/types';
import { SINDICATOS_LIST, type SindicatoContactItem } from '@/data/sindicatos-list';

export default function SindicatosClient() {
  const [platformStores, setPlatformStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUf, setSelectedUf] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    api
      .marketplaceListStores({ type: 'SINDICATO', limit: '48' })
      .then((response) => setPlatformStores(response.data))
      .catch(() => setPlatformStores([]))
      .finally(() => setLoading(false));
  }, []);

  // List of all UFs available
  const availableUfs = useMemo(() => {
    const set = new Set<string>();
    SINDICATOS_LIST.forEach((s) => {
      if (s.uf) set.add(s.uf);
    });
    platformStores.forEach((s) => {
      const uf = s.city?.state?.uf;
      if (uf) set.add(uf);
    });
    return Array.from(set).sort();
  }, [platformStores]);

  // Unified items (registered stores take precedence if matching)
  const filteredSindicatos = useMemo(() => {
    return SINDICATOS_LIST.filter((s) => {
      if (selectedUf !== 'ALL' && s.uf !== selectedUf) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.nome.toLowerCase().includes(q);
        const matchSigla = (s.sigla || '').toLowerCase().includes(q);
        const matchCity = (s.cidade || '').toLowerCase().includes(q);
        if (!matchName && !matchSigla && !matchCity) return false;
      }
      return true;
    });
  }, [selectedUf, searchQuery]);

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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, sigla ou cidade…"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedUf('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedUf === 'ALL'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({filteredSindicatos.length})
              </button>
              {availableUfs.map((uf) => (
                <button
                  key={uf}
                  onClick={() => setSelectedUf(uf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    selectedUf === uf
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {uf}
                </button>
              ))}
            </div>
          </div>

          {/* REGISTERED STORES (IF ANY) */}
          {platformStores.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>⭐</span>
                <span>Entidades Credenciadas no Alô Tio</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {platformStores.map((store) => (
                  <Link
                    key={store.id}
                    href={`/lojas/${store.slug}`}
                    className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 hover:shadow-lg transition relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex gap-4 items-center mb-3">
                        <div className="w-14 h-14 rounded-xl bg-emerald-50 overflow-hidden flex items-center justify-center shrink-0">
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
                          <h3 className="font-bold text-base text-gray-900 truncate">
                            {store.displayName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {store.city?.name ? `${store.city.name} (${store.city.state?.uf})` : 'Entidade Parceira'}
                          </p>
                          <span className="inline-block mt-1 text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            Perfil Oficial
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
                      <span className="text-xs font-bold text-emerald-700">Ver página completa →</span>
                      {store.whatsapp && (
                        <span className="text-xs text-gray-500">WhatsApp Ativo</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* MAIN DIRECTORY GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>🏛️</span>
                <span>Guia de Entidades e Associações de Transporte Escolar ({filteredSindicatos.length})</span>
              </h2>
            </div>

            {filteredSindicatos.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 text-gray-500">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="font-semibold text-gray-700">Nenhum sindicato ou associação encontrado para este filtro.</p>
                <button
                  onClick={() => {
                    setSelectedUf('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-emerald-700 underline text-sm font-semibold"
                >
                  Ver todos os estados
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSindicatos.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          {s.tipo ? s.tipo.toUpperCase() : 'SINDICATO'}
                        </span>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {s.uf}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-gray-900 leading-snug">
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
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-gray-800 block truncate">
                          📞 {s.telefone}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {s.telefoneValido && (
                          <a
                            href={`https://wa.me/55${s.telefoneRaw?.replace(/\D/g, '') || s.telefone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá! Vi o contato da ${s.sigla || s.nome} no portal Alô Tio.`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
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
