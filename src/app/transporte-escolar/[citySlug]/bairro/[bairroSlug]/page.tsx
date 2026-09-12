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
import { bairroStaticParams } from '@/lib/seo-static-params';
import { SEO_CORE_KEYWORDS } from '@/lib/seo-keywords';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

type Props = { params: Promise<{ citySlug: string; bairroSlug: string }> };

/** ISR 30 dias (literal estático exigido pelo Next.js). */
export const revalidate = 2_592_000;

export async function generateStaticParams() {
  return bairroStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug, bairroSlug } = await params;
  const city = await fetchCityBySlug(citySlug);
  if (!city) return { title: 'Bairro' };

  const neighborhoods = await fetchNeighborhoodsForCity(city.id);
  const match = neighborhoods.find((n) => neighborhoodSlug(n.name) === bairroSlug);
  if (!match) return { title: 'Bairro' };

  const { total } = await fetchTiosForGeo({
    cityId: city.id,
    neighborhoodId: match.id,
    limit: 1,
  });

  const title = `Transporte escolar no bairro ${match.name} — ${city.name}/${city.state.uf}`;
  const countPhrase =
    total > 0
      ? `${total} condutor${total === 1 ? '' : 'es'} no bairro. `
      : '';
  const description = `${countPhrase}Condutor escolar, van escolar e motorista escolar no bairro ${match.name} (${city.name}, ${city.state.uf}). Transporte escolar particular, perua escolar e tio da van: busque no Alô Tio.`;
  const path = `/transporte-escolar/${city.slug}/bairro/${bairroSlug}`;

  return {
    title,
    description,
    keywords: [
      ...SEO_CORE_KEYWORDS,
      `transporte escolar ${match.name}`,
      `van escolar ${match.name}`,
      `condutor escolar ${match.name}`,
      `transporte escolar ${city.name}`,
    ],
    alternates: { canonical: `${siteUrl}${path}` },
    robots: {
      index: total > 0,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      locale: 'pt_BR',
      type: 'article',
    },
  };
}

export default async function TransporteEscolarBairroPage({ params }: Props) {
  const { citySlug, bairroSlug } = await params;
  const city = await fetchCityBySlug(citySlug);
  if (!city) notFound();
  if (city.slug !== citySlug.trim().toLowerCase()) {
    redirect(
      `/transporte-escolar/${city.slug}/bairro/${bairroSlug}`,
    );
  }

  const neighborhoods = await fetchNeighborhoodsForCity(city.id);
  const match = neighborhoods.find((n) => neighborhoodSlug(n.name) === bairroSlug);
  if (!match) notFound();

  const tiosResult = await fetchTiosForGeo({
    cityId: city.id,
    neighborhoodId: match.id,
    limit: 12,
  });

  const searchHref = tiosSearchHref({
    uf: city.state.uf,
    cidade: city.slug,
    bairro: neighborhoodSlug(match.name),
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
      {
        '@type': 'ListItem',
        position: 4,
        name: match.name,
        item: `${siteUrl}/transporte-escolar/${city.slug}/bairro/${bairroSlug}`,
      },
    ],
  };

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Transporte escolar — ${match.name}, ${city.name}`,
    description: `Condutor escolar e van escolar no bairro ${match.name}.`,
    url: `${siteUrl}/transporte-escolar/${city.slug}/bairro/${bairroSlug}`,
  };

  const itemListLd =
    tiosResult.data.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Condutores no bairro ${match.name}`,
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link href="/transporte-escolar" className="hover:text-primary">
            Transporte escolar
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/transporte-escolar/${city.slug}`} className="hover:text-primary">
            {city.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{match.name}</span>
        </nav>

        <h1 className="font-heading mb-4 text-3xl font-bold text-primary-900 sm:text-4xl">
          Transporte escolar no bairro {match.name}
        </h1>
        <p className="mb-6 text-gray-600">
          {city.name} — {city.state.uf}
          {tiosResult.total > 0 && (
            <>
              {' · '}
              <strong>{tiosResult.total}</strong> transportador
              {tiosResult.total === 1 ? '' : 'es'} neste bairro
            </>
          )}
        </p>

        <div className="mb-8 max-w-none space-y-4 text-gray-700 leading-relaxed">
          <p>
            Quem busca <strong>transporte escolar no bairro {match.name}</strong> costuma procurar por{' '}
            <strong>condutor escolar</strong>, <strong>van escolar</strong> ou{' '}
            <strong>tio da van</strong> cadastrado para atender as escolas da região de {city.name}.
          </p>
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-gray-700">
            <h3 className="font-heading font-bold text-blue-900 mb-2">
              💡 Dicas para contratar transporte escolar no bairro {match.name}:
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li>Confirme se o condutor possui autorização e vistoria atualizadas no órgão de trânsito de {city.name}.</li>
              <li>Verifique o tempo de trajeto entre sua residência no bairro {match.name} e a escola do seu filho.</li>
              <li>Pergunte sobre a presença de monitor(a) acompanhante para crianças da educação infantil.</li>
              <li>Exija sempre a formalização de contrato de prestação de serviços com cláusulas claras.</li>
            </ul>
            <p className="mt-3">
              <Link href="/guias/como-escolher-transporte-escolar-seguro" className="font-semibold text-primary hover:underline">
                Consulte nosso Guia Completo de Segurança no Transporte Escolar →
              </Link>
            </p>
          </div>
        </div>

        {tiosResult.data.length > 0 && (
          <section className="mb-10" aria-labelledby="tios-bairro-heading">
            <h2
              id="tios-bairro-heading"
              className="font-heading mb-4 text-lg font-semibold text-gray-900"
            >
              Transportadores no bairro {match.name}
            </h2>
            <ul className="grid gap-4">
              {tiosResult.data.map((tio) => (
                <li key={tio.id}>
                  <TioPublicCard tio={tio} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {tiosResult.data.length === 0 && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-600 mb-4">
              No momento ainda não há motoristas com cadastro verificado exclusivamente no bairro {match.name}.
            </p>
            <p className="text-sm text-gray-500">
              Muitos condutores de {city.name} cobrem múltiplos bairros ao longo da rota. Recomendamos buscar diretamente pela escola do seu filho.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={searchHref}
            className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-600"
          >
            Buscar por escola em {city.name}
          </Link>
          <Link
            href={`/transporte-escolar/${city.slug}`}
            className="inline-block rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-800 transition hover:bg-gray-50"
          >
            Ver todos os bairros em {city.name}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
