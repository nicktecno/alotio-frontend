'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageLightbox from '@/components/ImageLightbox';
import { api, assetUrl } from '@/lib/api';
import type { TioPublicView } from '@/types';
import Loading from '@/components/Loading';

export default function TioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tio, setTio] = useState<TioPublicView | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  useEffect(() => {
    if (id) {
      api
        .getTioById(id)
        .then((data) => setTio(data as TioPublicView))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Loading />
      </div>
    );
  }

  if (!tio) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">Tio não encontrado</h1>
          <Link href="/tios" className="text-primary hover:underline">
            Voltar à busca
          </Link>
        </div>
      </div>
    );
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Transporte Escolar - ${tio.displayName}`,
    description: tio.bio || `Serviço de transporte escolar em ${tio.city.name}/${tio.city.state.uf}`,
    provider: {
      '@type': 'Person',
      name: tio.displayName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: tio.city.name,
        addressRegion: tio.city.state.uf,
        addressCountry: 'BR',
      },
    },
    serviceType: 'Transporte Escolar',
    areaServed: tio.isIntermunicipal && tio.secondaryCity
      ? [
          { '@type': 'City', name: tio.city.name },
          { '@type': 'City', name: tio.secondaryCity.name },
        ]
      : { '@type': 'City', name: tio.city.name },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tios" className="text-primary hover:underline text-sm mb-6 inline-block">
          &larr; Voltar à busca
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-600 p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                {tio.avatarUrl ? (
                  <img
                    src={assetUrl(tio.avatarUrl)!}
                    alt={tio.displayName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/50 cursor-pointer hover:opacity-80 transition"
                    onClick={() => setLightbox({ images: [assetUrl(tio.avatarUrl)!], index: 0 })}
                  />
                ) : (
                  <span className="text-4xl text-white font-bold">
                    {tio.displayName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="text-white">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-heading text-3xl font-bold">{tio.displayName}</h1>
                  {tio.isPremium && (
                    <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Premium
                    </span>
                  )}
                  {tio.isIntermunicipal && (
                    <span className="bg-amber-400/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Intermunicipal
                    </span>
                  )}
                </div>
                <p className="text-primary-100 mt-1">Prefixo {tio.prefixo}</p>
                {tio.isIntermunicipal && tio.secondaryCity ? (
                  <div className="text-primary-100/95 mt-1 space-y-0.5 text-sm">
                    <div>{tio.city.name}/{tio.city.state.uf}</div>
                    <div>e {tio.secondaryCity.name}/{tio.secondaryCity.state.uf}</div>
                  </div>
                ) : (
                  <p className="text-primary-100 mt-1">
                    {tio.city.name}/{tio.city.state.uf}
                  </p>
                )}
                {tio.phone && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a
                      href={`tel:${tio.phone}`}
                      className="inline-flex items-center gap-1.5 bg-white text-primary px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-50 transition"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z"/></svg>
                      {tio.phone}
                    </a>
                    <a
                      href={`https://wa.me/55${tio.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#1da851] transition"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Bio */}
            {tio.bio && (
              <div>
                <h2 className="font-heading text-lg font-semibold text-gray-900 mb-2">Sobre</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{tio.bio}</p>
              </div>
            )}

            {/* Amenities */}
            {(tio.hasTV || tio.hasAC || tio.hasMonitor) && (
              <div>
                <h2 className="font-heading text-lg font-semibold text-gray-900 mb-3">Comodidades do veículo</h2>
                <div className="flex flex-wrap gap-3">
                  {tio.hasTV && (
                    <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
                      📺 TV
                    </span>
                  )}
                  {tio.hasAC && (
                    <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                      ❄️ Ar-condicionado
                    </span>
                  )}
                  {tio.hasMonitor && (
                    <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                      👀 Monitor de crianças
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Schools */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-gray-900 mb-3">Escolas atendidas</h2>
              <div className="flex flex-wrap gap-2">
                {tio.schools.map((s) => (
                  <span
                    key={s.id}
                    className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Neighborhoods */}
            {tio.neighborhoods.length > 0 && (() => {
              const grouped = tio.neighborhoods.reduce<Record<string, typeof tio.neighborhoods>>((acc, n) => {
                const key = n.cityName || tio.city.name;
                if (!acc[key]) acc[key] = [];
                acc[key].push(n);
                return acc;
              }, {});
              const entries = Object.entries(grouped);
              return (
                <div>
                  <h2 className="font-heading text-lg font-semibold text-gray-900 mb-3">Bairros atendidos</h2>
                  <div className="space-y-3">
                    {entries.map(([cityName, nbs]) => (
                      <div key={cityName}>
                        {entries.length > 1 && (
                          <p className="text-sm font-medium text-gray-500 mb-1.5">{cityName}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {nbs.map((n) => (
                            <span
                              key={n.id}
                              className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                            >
                              {n.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Vehicle Photos (premium only) */}
            {tio.vehiclePhotos.length > 0 && (
              <div>
                <h2 className="font-heading text-lg font-semibold text-gray-900 mb-3">Fotos do Veículo</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tio.vehiclePhotos.map((photo, idx) => (
                    <img
                      key={photo.id}
                      src={assetUrl(photo.url)!}
                      alt="Veículo"
                      className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-80 transition"
                      onClick={() =>
                        setLightbox({
                          images: tio.vehiclePhotos.map((p) => assetUrl(p.url)!),
                          index: idx,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
