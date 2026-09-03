'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, assetUrl } from '@/lib/api';
import type { Store } from '@/types';

export default function PartnerSchoolsCarousel() {
  const [schools, setSchools] = useState<Store[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .marketplaceFeatured(12, { type: 'ESCOLA' })
      .then(setSchools)
      .catch(() => setSchools([]));
  }, []);

  if (schools.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    scroller.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <section className="py-14 bg-[#fff8e8] border-t border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
              Conteúdo patrocinado
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 font-heading">
              Escolas parceiras
            </h2>
            <p className="text-gray-600 mt-1">Conheça benefícios e campanhas de matrícula.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/escolas-parceiras" className="text-primary font-semibold hover:underline hidden sm:inline">
              Ver todas →
            </Link>
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Escola anterior" className="w-9 h-9 rounded-full border border-amber-300 bg-white text-gray-700 hover:bg-amber-50 transition">
              ‹
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Próxima escola" className="w-9 h-9 rounded-full border border-amber-300 bg-white text-gray-700 hover:bg-amber-50 transition">
              ›
            </button>
          </div>
        </div>

        <div ref={scroller} className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {schools.map((school) => (
            <Link key={school.id} href={`/escolas-parceiras/${school.slug}`} className="snap-start shrink-0 w-72 bg-white border border-amber-200 rounded-lg p-5 hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-amber-50 overflow-hidden flex items-center justify-center shrink-0">
                  {school.logoUrl ? (
                    <img src={assetUrl(school.logoUrl) ?? ''} alt={school.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🏫</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-primary-900 truncate">{school.displayName}</h3>
                  <p className="text-sm text-gray-500 truncate">{school.city?.name ?? 'Conheça a escola'}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-1 rounded">
                    Patrocinado
                  </span>
                </div>
              </div>
              {(school._count?.products ?? 0) > 0 && (
                <p className="mt-4 text-sm font-semibold text-primary">Ver promoções e benefícios →</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}