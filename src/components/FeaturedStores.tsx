'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, assetUrl } from '@/lib/api';
import type { Store } from '@/types';

export default function FeaturedStores() {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    api
      .marketplaceFeatured(6, { excludeType: 'ESCOLA' })
      .then(setStores)
      .catch(() => setStores([]));
  }, []);

  if (stores.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 font-heading">
            Lojas em destaque
          </h2>
          <Link
            href="/lojas"
            className="text-primary font-semibold hover:underline"
          >
            Ver todas as lojas →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/lojas/${store.slug}`}
              className="block rounded-xl p-5 border border-secondary-300 bg-white ring-1 ring-secondary-200 transition hover:shadow-md"
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
                    <span className="text-2xl">
                      {store.type === 'VAN' ? '🚐' : '🔧'}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-primary-900 truncate">
                      {store.displayName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-white">
                      DESTAQUE
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {store.type === 'VAN' ? 'Vans e veículos' : 'Peças e acessórios'}
                    {store.city ? ` · ${store.city.name}` : ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
