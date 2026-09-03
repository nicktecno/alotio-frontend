'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, assetUrl } from '@/lib/api';
import type { Store } from '@/types';

export default function PartnerSchoolsClient() {
  const [schools, setSchools] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .marketplaceListStores({ type: 'ESCOLA', limit: '48' })
      .then((response) => setSchools(response.data))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-[#fffdf7]">
        <section className="bg-primary py-12 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Conteúdo patrocinado</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Escolas parceiras</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <p className="text-primary-100 mt-2 max-w-2xl">Conheça propostas, benefícios e campanhas divulgadas pelas próprias instituições.</p>
              <Link href="/cadastro-escola-parceira" className="shrink-0 bg-secondary hover:bg-secondary-600 text-white px-5 py-3 rounded-lg font-bold transition">Anunciar minha escola</Link>
            </div>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <p className="text-gray-500">Carregando…</p>
          ) : schools.length === 0 ? (
            <div className="py-14 text-center">
              <h2 className="text-xl font-bold text-primary-900">Em breve, novas escolas parceiras</h2>
              <Link href="/cadastro-escola-parceira" className="inline-block mt-4 text-primary font-semibold hover:underline">Anunciar uma escola →</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {schools.map((school) => (
                <Link key={school.id} href={`/escolas-parceiras/${school.slug}`} className="bg-white border border-amber-200 rounded-lg p-5 hover:shadow-md transition">
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-lg bg-amber-50 overflow-hidden flex items-center justify-center shrink-0">
                      {school.logoUrl ? <img src={assetUrl(school.logoUrl) ?? ''} alt={school.displayName} className="w-full h-full object-cover" /> : <span className="text-4xl">🏫</span>}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-lg text-primary-900 truncate">{school.displayName}</h2>
                      <p className="text-sm text-gray-500">{school.city?.name ?? 'Escola parceira'}</p>
                      <p className="text-sm text-primary font-semibold mt-2">{school._count?.products ?? 0} promoção(ões)</p>
                    </div>
                  </div>
                  {school.bio && <p className="text-sm text-gray-600 mt-4 line-clamp-2">{school.bio}</p>}
                  <span className="inline-block mt-4 text-[10px] uppercase font-bold tracking-wider text-amber-800">Patrocinado</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}