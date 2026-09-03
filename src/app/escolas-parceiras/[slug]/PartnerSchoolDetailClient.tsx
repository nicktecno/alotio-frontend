'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, assetUrl } from '@/lib/api';
import type { Store } from '@/types';

function onlyDigits(value?: string | null) {
  return (value ?? '').replace(/\D/g, '');
}

export default function PartnerSchoolDetailClient() {
  const { slug } = useParams<{ slug: string }>();
  const [school, setSchool] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.marketplaceGetStore(slug)
      .then((result) => setSchool(result.type === 'ESCOLA' ? result : null))
      .catch(() => setSchool(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const whatsapp = onlyDigits(school?.whatsapp || school?.phone);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-[#fffdf7]">
        {loading ? <div className="max-w-6xl mx-auto px-4 py-16 text-gray-500">Carregando…</div> : !school ? <div className="max-w-6xl mx-auto px-4 py-16 text-gray-600">Escola parceira não encontrada.</div> : (
          <>
            <section className="bg-primary text-white py-10">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-28 h-28 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0">
                  {school.logoUrl ? <img src={assetUrl(school.logoUrl) ?? ''} alt={school.displayName} className="w-full h-full object-cover" /> : <span className="text-5xl">🏫</span>}
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-secondary">Escola parceira · Patrocinado</span>
                  <h1 className="text-3xl sm:text-4xl font-bold mt-2">{school.displayName}</h1>
                  <p className="text-primary-100 mt-1">{school.city?.name}{school.city?.state?.uf ? `/${school.city.state.uf}` : ''}</p>
                  {whatsapp && <a href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex mt-5 bg-[#178a4b] hover:bg-[#12713d] text-white px-5 py-2.5 rounded-lg font-semibold transition">Falar com a escola</a>}
                </div>
              </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
              {school.bio && <section><h2 className="text-2xl font-bold text-primary-900 mb-3">Sobre a escola e seus benefícios</h2><p className="text-gray-700 whitespace-pre-line leading-relaxed">{school.bio}</p></section>}
              <section>
                <h2 className="text-2xl font-bold text-primary-900 mb-5">Promoções e novidades</h2>
                {!school.products?.length ? <p className="text-gray-600">Nenhuma promoção publicada no momento.</p> : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {school.products.map((promotion) => (
                      <article key={promotion.id} className="bg-white border border-amber-200 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-amber-50 flex items-center justify-center">
                          {promotion.images[0] ? <img src={assetUrl(promotion.images[0].url) ?? ''} alt={promotion.title} className="w-full h-full object-cover" /> : <span className="text-4xl">🎓</span>}
                        </div>
                        <div className="p-5">
                          {promotion.category && <p className="text-xs uppercase font-bold tracking-wider text-amber-700">{promotion.category}</p>}
                          <h3 className="font-bold text-lg text-primary-900 mt-1">{promotion.title}</h3>
                          {promotion.description && <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{promotion.description}</p>}
                          {promotion.priceCents != null && <p className="text-primary font-bold mt-3">R$ {(promotion.priceCents / 100).toFixed(2).replace('.', ',')}</p>}
                          {promotion.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 mt-4">
                              {promotion.images.slice(1).map((image, index) => (
                                <img key={image.id} src={assetUrl(image.url) ?? ''} alt={`${promotion.title} - foto ${index + 2}`} className="aspect-square w-full object-cover rounded" />
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}