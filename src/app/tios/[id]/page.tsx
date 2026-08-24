import type { Metadata } from 'next';
import TioDetailClient from './TioDetailClient';
import { seoFetchInit } from '@/lib/seo-revalidate';
import { tioStaticParams } from '@/lib/seo-static-params';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

/** ISR 30 dias (literal estático exigido pelo Next.js). */
export const revalidate = 2_592_000;

export async function generateStaticParams() {
  return tioStaticParams();
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${apiUrl}/tios/${id}`, seoFetchInit());
    if (!res.ok) throw new Error('Not found');

    const tio = await res.json();
    const cityName = tio.city?.name || '';
    const stateName = tio.city?.state?.uf || 'SP';
    const schoolNames = (tio.schools || []).slice(0, 3).map((s: { name: string }) => s.name).join(', ');

    const title = `${tio.displayName} - Transporte Escolar em ${cityName}/${stateName}`;
    const description = `${tio.displayName} oferece transporte escolar em ${cityName}/${stateName}. ${
      schoolNames ? `Atende: ${schoolNames}.` : ''
    } Prefixo ${tio.prefixo}. Encontre van escolar segura no Alô Tio.`;

    return {
      title,
      description,
      keywords: [
        `transporte escolar ${cityName}`,
        `van escolar ${cityName}`,
        `tio da van ${cityName}`,
        tio.displayName,
        ...((tio.schools || []) as { name: string }[]).map((s: { name: string }) => `transporte escolar ${s.name}`),
      ],
      openGraph: {
        title,
        description,
        url: `${siteUrl}/tios/${id}`,
        type: 'profile',
        images: tio.avatarUrl
          ? [{ url: tio.avatarUrl.startsWith('http') ? tio.avatarUrl : `${apiUrl.replace(/\/api$/, '')}${tio.avatarUrl}`, alt: tio.displayName }]
          : [{ url: '/bannerAlotio.png', alt: 'Alô Tio' }],
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
      alternates: {
        canonical: `${siteUrl}/tios/${id}`,
      },
    };
  } catch {
    return {
      title: 'Transportador Escolar',
      description: 'Encontre transporte escolar seguro e verificado no Alô Tio.',
    };
  }
}

export default function TioDetailPage() {
  return <TioDetailClient />;
}
