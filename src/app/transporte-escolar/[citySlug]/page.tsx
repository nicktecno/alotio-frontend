import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  fetchCityBySlug,
  fetchNeighborhoodsForCity,
} from '@/lib/seo-transporte-api';
import { neighborhoodSlug } from '@/lib/slug';
import { SEO_CORE_KEYWORDS } from '@/lib/seo-keywords';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

type Props = { params: Promise<{ citySlug: string }> };

export const revalidate = 86_400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params;
  const city = await fetchCityBySlug(citySlug);
  if (!city) {
    return { title: 'Cidade' };
  }
  const cityLabel = `${city.name}/${city.state.uf}`;
  const title = `Transporte escolar em ${cityLabel} — condutor escolar e van escolar`;
  const description = `Condutor escolar, van escolar e motorista de transporte escolar em ${city.name} (${city.state.uf}). Perua escolar, tio da van e transporte por bairro. Busca gratuita no Alô Tio.`;
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

  const neighborhoods = await fetchNeighborhoodsForCity(city.id);
  const shown = neighborhoods.slice(0, 72);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Transporte escolar', item: `${siteUrl}/transporte-escolar` },
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={webPageLd} />
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-gray-500 mb-6">
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

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary-900 mb-4">
          Transporte escolar em {city.name} ({city.state.uf})
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl leading-relaxed">
          Procurando <strong>condutor escolar</strong>, <strong>van escolar</strong> ou{' '}
          <strong>motorista de transporte escolar</strong> em {city.name}? No Alô Tio você encontra profissionais
          verificados — também chamados de <em>tio da van</em> ou <em>perua escolar</em>, conforme a região. Use a busca
          por escola e, se quiser, refine por bairro.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/tios"
            className="inline-block bg-primary hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Buscar tios em {city.name}
          </Link>
          <Link
            href="/transporte-escolar"
            className="inline-block border border-gray-300 text-gray-800 font-medium px-6 py-3 rounded-lg hover:bg-white transition"
          >
            Outras cidades
          </Link>
        </div>

        {shown.length > 0 && (
          <>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              Transporte escolar por bairro em {city.name}
            </h2>
            <p className="text-gray-600 mb-4 text-sm max-w-3xl">
              Páginas com texto focado em <strong>transporte escolar no bairro</strong> e sinónimos (condutor escolar,
              van escolar). A disponibilidade real de motoristas você confere na busca.
            </p>
            <ul className="flex flex-wrap gap-2 mb-6">
              {shown.map((n) => {
                const slug = neighborhoodSlug(n.name);
                return (
                  <li key={n.id}>
                    <Link
                      href={`/transporte-escolar/${city.slug}/bairro/${slug}`}
                      className="inline-block px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-800 text-sm hover:border-primary hover:text-primary transition"
                    >
                      {n.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {neighborhoods.length > shown.length && (
              <p className="text-sm text-gray-500 mb-8">
                E mais {neighborhoods.length - shown.length} bairros cadastrados — use a busca para filtrar por nome.
              </p>
            )}
          </>
        )}

        {neighborhoods.length === 0 && (
          <p className="text-gray-600 mb-8">
            Ainda não há bairros cadastrados para esta cidade no sistema.{' '}
            <Link href="/tios" className="text-primary font-medium hover:underline">
              Faça a busca por escola
            </Link>{' '}
            para encontrar transportadores.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
