'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, assetUrl } from '@/lib/api';
import type { StorePlan, StoreType } from '@/types';

type CarouselProduct = {
  id: string;
  title: string;
  priceCents: number | null;
  category: string | null;
  images: { url: string }[];
  store: { slug: string; displayName: string; type: StoreType; plan: StorePlan };
};

function formatPrice(cents: number | null): string {
  if (cents == null) return 'Sob consulta';
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

interface Props {
  type: StoreType;
  title: string;
  subtitle?: string;
}

export default function ProductCarousel({ type, title, subtitle }: Props) {
  const [products, setProducts] = useState<CarouselProduct[] | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .marketplaceProducts(type, 12)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [type]);

  // Só aparece quando existem anúncios cadastrados desse tipo.
  if (!products || products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const fallbackIcon = type === 'VAN' ? '🚐' : '🔧';

  return (
    <section className="py-14 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 font-heading">
              {title}
            </h2>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/lojas?type=${type}`}
              className="text-primary font-semibold hover:underline hidden sm:inline"
            >
              Ver todas →
            </Link>
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Anterior"
              className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center"
            >
              ‹
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Próximo"
              className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/lojas/${p.store.slug}`}
              className="snap-start shrink-0 w-56 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                {p.images[0] ? (
                  <img
                    src={assetUrl(p.images[0].url) ?? ''}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-300">{fallbackIcon}</span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-primary-900 text-sm truncate">
                  {p.title}
                </h3>
                <p className="text-primary font-bold text-sm mt-1">
                  {formatPrice(p.priceCents)}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {p.store.displayName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
