import type { Metadata } from 'next';
import SindicatoDetailClient from './SindicatoDetailClient';
import { SINDICATOS_LIST, findSindicatoByIdOrSlug } from '@/data/sindicatos-list';
import { JsonLd } from '@/components/seo/JsonLd';
import { seoFetchInit } from '@/lib/seo-revalidate';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

/** ISR 30 dias (literal estático exigido pelo Next.js). */
export const revalidate = 2_592_000;

export async function generateStaticParams() {
  return SINDICATOS_LIST.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const localItem = findSindicatoByIdOrSlug(slug);

  let title = 'Sindicato ou Associação de Transporte Escolar | Alô Tio';
  let description =
    'Informações de contato, diretoria, vistorias e serviços para condutores de transporte escolar.';
  let ogImage = `${siteUrl}/bannerAlotio.png`;

  if (localItem) {
    const siglaOrName = localItem.sigla || localItem.nome;
    const location = localItem.cidade
      ? ` em ${localItem.cidade} (${localItem.uf})`
      : localItem.uf
        ? ` (${localItem.uf})`
        : '';
    const tipoLabel =
      localItem.tipo === 'associacao'
        ? 'Associação de Transporte Escolar'
        : localItem.tipo === 'cooperativa'
          ? 'Cooperativa de Transporte Escolar'
          : 'Sindicato de Transporte Escolar';

    title = `${siglaOrName} - ${tipoLabel}${location} | Alô Tio`;
    description =
      localItem.observacoes ||
      `Conheça a atuação, telefones, WhatsApp, diretoria e serviços da ${siglaOrName}${location}. Entidade representativa de condutores de vans escolares legalizados.`;
  }

  // Tenta também ver se existe uma store registrada no backend
  try {
    const res = await fetch(
      `${apiUrl}/marketplace/stores/${encodeURIComponent(slug)}`,
      seoFetchInit(),
    );
    if (res.ok) {
      const store = await res.json();
      if (store && store.type === 'SINDICATO') {
        const cityName = store.city?.name ? ` em ${store.city.name}` : '';
        title = `${store.displayName}${cityName} | Entidade Parceira Alô Tio`;
        if (store.bio) description = store.bio.slice(0, 160);
        if (store.logoUrl) {
          ogImage = store.logoUrl.startsWith('http')
            ? store.logoUrl
            : `${apiUrl.replace(/\/api$/, '')}${store.logoUrl}`;
        }
      }
    }
  } catch {
    // Fallback silencioso para dados locais
  }

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/sindicatos/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/sindicatos/${slug}`,
      images: [{ url: ogImage, alt: title }],
    },
  };
}

export default async function SindicatoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const localItem = findSindicatoByIdOrSlug(slug);

  const jsonLdData = localItem
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: localItem.nome,
        alternateName: localItem.sigla,
        description: localItem.observacoes || `Entidade representativa de condutores de transporte escolar.`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: localItem.cidade,
          addressRegion: localItem.uf,
          addressCountry: 'BR',
        },
        telephone: localItem.telefone || localItem.telefoneFixo,
        email: localItem.email,
        url: localItem.website || `${siteUrl}/sindicatos/${slug}`,
      }
    : null;

  return (
    <>
      {jsonLdData && <JsonLd data={jsonLdData} />}
      <SindicatoDetailClient />
    </>
  );
}
