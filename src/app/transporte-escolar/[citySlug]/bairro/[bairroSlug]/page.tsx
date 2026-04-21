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

type Props = { params: Promise<{ citySlug: string; bairroSlug: string }> };

export const revalidate = 86_400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug, bairroSlug } = await params;
  const city = await fetchCityBySlug(citySlug);
  if (!city) return { title: 'Bairro' };

  const neighborhoods = await fetchNeighborhoodsForCity(city.id);
  const match = neighborhoods.find((n) => neighborhoodSlug(n.name) === bairroSlug);
  if (!match) return { title: 'Bairro' };

  const title = `Transporte escolar no bairro ${match.name} — ${city.name}/${city.state.uf}`;
  const description = `Condutor escolar, van escolar e motorista escolar no bairro ${match.name} (${city.name}, ${city.state.uf}). Transporte escolar particular, perua escolar e tio da van: busque no Alô Tio.`;
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
      `condutor escolar ${city.name}`,
      `motorista escolar ${city.name}`,
    ],
    alternates: { canonical: `${siteUrl}${path}` },
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

  const neighborhoods = await fetchNeighborhoodsForCity(city.id);
  const match = neighborhoods.find((n) => neighborhoodSlug(n.name) === bairroSlug);
  if (!match) notFound();

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={webPageLd} />
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-gray-500 mb-6">
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

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary-900 mb-4">
          Transporte escolar no bairro {match.name}
        </h1>
        <p className="text-gray-600 mb-2">
          {city.name} — {city.state.uf}
        </p>

        <div className="prose prose-gray max-w-none text-gray-700 space-y-4 mb-8">
          <p>
            Quem busca <strong>transporte escolar no bairro {match.name}</strong> costuma usar também termos como{' '}
            <strong>condutor escolar</strong>, <strong>van escolar</strong>, <strong>motorista escolar</strong>,{' '}
            <strong>perua escolar</strong> ou <strong>tio da van</strong>. No Alô Tio você localiza perfis
            verificados que atendem escolas na região — combine rota, horário e valores direto com o profissional.
          </p>
          <p>
            Esta página é informativa para SEO. Para ver quem está disponível hoje, use a busca oficial com escola e,
            se quiser, filtre por este bairro.
          </p>
        </div>

        <Link
          href="/tios"
          className="inline-block bg-primary hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Abrir busca de transporte escolar
        </Link>

        <p className="mt-8 text-sm text-gray-500">
          <Link href={`/transporte-escolar/${city.slug}`} className="text-primary hover:underline">
            Ver outros bairros em {city.name}
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
