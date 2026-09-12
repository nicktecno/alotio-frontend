import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { TioPublicCard } from '@/components/seo/TioPublicCard';
import {
  fetchCityBySlug,
  fetchNeighborhoodsForCity,
  fetchTiosForGeo,
} from '@/lib/seo-transporte-api';
import { tiosSearchHref } from '@/lib/seo-search-url';
import { neighborhoodSlug } from '@/lib/slug';
import { cityStaticParams } from '@/lib/seo-static-params';
import { SEO_CORE_KEYWORDS } from '@/lib/seo-keywords';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

type Props = { params: Promise<{ citySlug: string }> };

/** ISR 30 dias (literal estático exigido pelo Next.js). */
export const revalidate = 2_592_000;

export async function generateStaticParams() {
  return cityStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params;
  const city = await fetchCityBySlug(citySlug);
  if (!city) {
    return { title: 'Cidade' };
  }
  const { total } = await fetchTiosForGeo({
    cityId: city.id,
    stateId: city.stateId,
    limit: 1,
  });
  const cityLabel = `${city.name}/${city.state.uf}`;
  const title = `Transporte escolar em ${cityLabel} — condutor escolar e van escolar`;
  const countPhrase =
    total > 0
      ? `${total} condutor${total === 1 ? '' : 'es'} escolar${total === 1 ? '' : 'is'} cadastrado${total === 1 ? '' : 's'}. `
      : '';
  const description = `${countPhrase}Condutor escolar, van escolar e motorista de transporte escolar em ${city.name} (${city.state.uf}). Perua escolar, tio da van e transporte por bairro. Busca gratuita no Alô Tio.`;
  return {
    title,
    description,
    keywords: [
      ...SEO_CORE_KEYWORDS,
      `transporte escolar ${city.name}`,
      `van escolar ${city.name}`,
      `condutor escolar ${city.name}`,
      `motorista escolar ${city.name}`,
    ],
    alternates: { canonical: `${siteUrl}/transporte-escolar/${city.slug}` },
    robots: {
      index: total > 0,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/transporte-escolar/${city.slug}`,
      locale: 'pt_BR',
      type: 'website',
    },
  };
}

export default async function TransporteEscolarCidadePage({ params }: Props) {
  const { citySlug } = await params;
  const city = await fetchCityBySlug(citySlug);
  if (!city) notFound();
  if (city.slug !== citySlug.trim().toLowerCase()) {
    redirect(`/transporte-escolar/${city.slug}`);
  }

  const [neighborhoods, tiosResult] = await Promise.all([
    fetchNeighborhoodsForCity(city.id),
    fetchTiosForGeo({
      cityId: city.id,
      stateId: city.stateId,
      limit: 12,
    }),
  ]);
  const shown = neighborhoods.slice(0, 72);
  const searchHref = tiosSearchHref({
    uf: city.state.uf,
    cidade: city.slug,
  });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Transporte escolar',
        item: `${siteUrl}/transporte-escolar`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.name,
        item: `${siteUrl}/transporte-escolar/${city.slug}`,
      },
    ],
  };

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Transporte escolar em ${city.name}`,
    description: `Condutor escolar e van escolar em ${city.name}, ${city.state.uf}.`,
    url: `${siteUrl}/transporte-escolar/${city.slug}`,
    about: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: city.state.name,
      },
    },
  };

  const itemListLd =
    tiosResult.data.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Condutores escolares em ${city.name}`,
          numberOfItems: tiosResult.total,
          itemListElement: tiosResult.data.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${siteUrl}/tios/${t.id}`,
            name: t.displayName,
          })),
        }
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={webPageLd} />
      {itemListLd && <JsonLd data={itemListLd} />}
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link href="/transporte-escolar" className="hover:text-primary">
            Transporte escolar
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{city.name}</span>
        </nav>

        <h1 className="font-heading mb-4 text-3xl font-bold text-primary-900 sm:text-4xl">
          Transporte escolar em {city.name} ({city.state.uf})
        </h1>
        <p className="mb-6 max-w-3xl text-lg leading-relaxed text-gray-600">
          Procurando <strong>condutor escolar</strong>, <strong>van escolar</strong> ou{' '}
          <strong>motorista de transporte escolar</strong> em {city.name}? No Alô Tio você
          encontra profissionais verificados — também chamados de <em>tio da van</em> ou{' '}
          <em>perua escolar</em>, conforme a região.
          {tiosResult.total > 0 && (
            <>
              {' '}
              Há <strong>{tiosResult.total}</strong> transportador
              {tiosResult.total === 1 ? '' : 'es'} cadastrado
              {tiosResult.total === 1 ? '' : 's'} nesta cidade.
            </>
          )}
        </p>

        <div className="mb-10 flex flex-wrap gap-3">
          <Link
            href={searchHref}
            className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-600"
          >
            Buscar por escola em {city.name}
          </Link>
          <Link
            href="/transporte-escolar"
            className="inline-block rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-800 transition hover:bg-white"
          >
            Outras cidades
          </Link>
        </div>

        {tiosResult.data.length > 0 && (
          <section className="mb-12" aria-labelledby="tios-cidade-heading">
            <h2
              id="tios-cidade-heading"
              className="font-heading mb-2 text-xl font-semibold text-gray-900"
            >
              Condutores escolares em {city.name}
            </h2>
            <p className="mb-5 max-w-3xl text-sm text-gray-600">
              Perfis verificados que atendem escolas na região. Escolha a escola na busca
              para refinar por bairro e horário.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {tiosResult.data.map((tio) => (
                <li key={tio.id}>
                  <TioPublicCard tio={tio} heading="h3" />
                </li>
              ))}
            </ul>
            {tiosResult.totalPages > 1 && (
              <p className="mt-6 text-sm text-gray-600">
                Mostrando {tiosResult.data.length} de {tiosResult.total} transportadores.{' '}
                <Link href={searchHref} className="font-medium text-primary hover:underline">
                  Ver todos e filtrar por escola
                </Link>
              </p>
            )}
          </section>
        )}

        {shown.length > 0 && (
          <>
            <h2 className="font-heading mb-3 text-xl font-semibold text-gray-900">
              Transporte escolar por bairro em {city.name}
            </h2>
            <p className="mb-4 max-w-3xl text-sm text-gray-600">
              Páginas com foco em <strong>transporte escolar no bairro</strong> e sinónimos
              (condutor escolar, van escolar).
            </p>
            <ul className="mb-6 flex flex-wrap gap-2">
              {shown.map((n) => {
                const slug = neighborhoodSlug(n.name);
                return (
                  <li key={n.id}>
                    <Link
                      href={`/transporte-escolar/${city.slug}/bairro/${slug}`}
                      className="inline-block rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 transition hover:border-primary hover:text-primary"
                    >
                      {n.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {neighborhoods.length > shown.length && (
              <p className="mb-8 text-sm text-gray-500">
                E mais {neighborhoods.length - shown.length} bairros cadastrados.
              </p>
            )}
          </>
        )}

        {neighborhoods.length === 0 && tiosResult.data.length === 0 && (
          <p className="mb-8 text-gray-600">
            Ainda não há transportadores ou bairros cadastrados para esta cidade.{' '}
            <Link href={searchHref} className="font-medium text-primary hover:underline">
              Tente a busca
            </Link>
            .
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
