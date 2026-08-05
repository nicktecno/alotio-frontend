import type { Metadata } from 'next';
import LojaDetailClient from './LojaDetailClient';
import { seoFetchInit } from '@/lib/seo-revalidate';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

/** ISR 30 dias (literal estático exigido pelo Next.js). */
export const revalidate = 2_592_000;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(
      `${apiUrl}/marketplace/stores/${encodeURIComponent(slug)}`,
      seoFetchInit(),
    );
    if (!res.ok) throw new Error('Not found');
    const store = await res.json();
    const typeLabel = store.type === 'VAN' ? 'vans e veículos' : 'peças e acessórios';
    const cityName = store.city?.name ? ` em ${store.city.name}` : '';
    const title = `${store.displayName} - ${store.type === 'VAN' ? 'Vans' : 'Peças'}${cityName} | Alô Tio`;
    const description = `${store.displayName} anuncia ${typeLabel}${cityName} no Alô Tio.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/lojas/${slug}`,
        images: store.logoUrl
          ? [
              {
                url: store.logoUrl.startsWith('http')
                  ? store.logoUrl
                  : `${apiUrl.replace(/\/api$/, '')}${store.logoUrl}`,
                alt: store.displayName,
              },
            ]
          : [{ url: '/bannerAlotio.png', alt: 'Alô Tio' }],
      },
      alternates: { canonical: `${siteUrl}/lojas/${slug}` },
    };
  } catch {
    return {
      title: 'Loja | Alô Tio',
      description: 'Anúncios de vans e peças para transporte escolar no Alô Tio.',
    };
  }
}

export default function LojaDetailPage() {
  return <LojaDetailClient />;
}
