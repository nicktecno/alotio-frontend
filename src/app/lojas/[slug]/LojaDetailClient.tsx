'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, assetUrl } from '@/lib/api';
import type { Store } from '@/types';

function formatPrice(cents: number | null): string {
  if (cents == null) return 'Sob consulta';
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

function onlyDigits(v?: string | null) {
  return (v ?? '').replace(/\D/g, '');
}

export default function LojaDetailClient() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api
      .marketplaceGetStore(slug)
      .then((s) => {
        if (s.type === 'SINDICATO') {
          router.replace(`/sindicatos/${slug}`);
          return;
        }
        if (s.type === 'ESCOLA') {
          router.replace(`/escolas-parceiras/${slug}`);
          return;
        }
        setStore(s);
      })
      .catch(() => setStore(null))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const whatsappDigits = onlyDigits(store?.whatsapp || store?.phone);
  const whatsappHref = whatsappDigits
    ? `https://wa.me/55${whatsappDigits}`
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        {loading ? (
          <div className="max-w-5xl mx-auto px-4 py-16 text-gray-500">
            Carregando…
          </div>
        ) : !store ? (
          <div className="max-w-5xl mx-auto px-4 py-16 text-gray-600">
            Loja não encontrada.
          </div>
        ) : (
          <>
            <section
              className={`py-10 ${store.plan === 'PREMIUM' ? 'bg-secondary-600' : 'bg-primary'}`}
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-5">
                <div className="w-24 h-24 rounded-xl bg-white/20 overflow-hidden flex items-center justify-center shrink-0">
                  {store.logoUrl ? (
                    <img
                      src={assetUrl(store.logoUrl) ?? ''}
                      alt={store.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">
                      {store.type === 'VAN' ? '🚐' : '🔧'}
                    </span>
                  )}
                </div>
                <div className="text-white">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                      {store.displayName}
                    </h1>
                    {store.plan === 'PREMIUM' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-secondary-700">
                        ⭐ PREMIUM
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 mt-1">
                    {store.type === 'VAN' ? 'Vans e veículos' : 'Peças e acessórios'}
                    {(() => {
                      const names = (store.serviceCities ?? []).map(
                        (sc) =>
                          `${sc.city.name}${sc.city.state?.uf ? `/${sc.city.state.uf}` : ''}`,
                      );
                      const label =
                        names.length > 0
                          ? names.join(', ')
                          : store.city
                            ? store.city.name
                            : '';
                      return label ? ` · ${label}` : '';
                    })()}
                  </p>
                </div>
              </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {store.bio && (
                <p className="text-gray-700 mb-6 whitespace-pre-line">
                  {store.bio}
                </p>
              )}

              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold transition mb-8"
                >
                  💬 Falar no WhatsApp
                </a>
              )}

              <h2 className="text-xl font-bold text-primary-900 mb-4">
                Anúncios
              </h2>
              {!store.products || store.products.length === 0 ? (
                <p className="text-gray-600">Esta loja ainda não tem anúncios.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {store.products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                    >
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        {p.images[0] ? (
                          <img
                            src={assetUrl(p.images[0].url) ?? ''}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl text-gray-300">
                            {store.type === 'VAN' ? '🚐' : '🔧'}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-primary-900">
                          {p.title}
                        </h3>
                        {p.category && (
                          <p className="text-xs text-gray-400">{p.category}</p>
                        )}
                        {p.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                            {p.description}
                          </p>
                        )}
                        <p className="text-primary font-bold mt-2">
                          {formatPrice(p.priceCents)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
