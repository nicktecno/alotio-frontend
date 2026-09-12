import type { MetadataRoute } from 'next';
import {
  fetchAllApprovedTioIds,
  fetchAllCitiesWithTios,
} from '@/lib/seo-transporte-api';
import { ARTICLES } from '@/lib/articles-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

/** Regenera o sitemap no máximo a cada 30 dias (literal estático exigido pelo Next.js). */
export const revalidate = 2_592_000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/tios`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/cadastro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacidade`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/termos-de-uso`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/transporte-escolar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/escolas-parceiras`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/cadastro-escola-parceira`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/guias`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  const guiaPages: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${siteUrl}/guias/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  const [tioIds, citiesWithTios] = await Promise.all([
    fetchAllApprovedTioIds(),
    fetchAllCitiesWithTios(),
  ]);

  const tioPages: MetadataRoute.Sitemap = tioIds.map((id) => ({
    url: `${siteUrl}/tios/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const transporteCidadePages: MetadataRoute.Sitemap = citiesWithTios.map((c) => ({
    url: `${siteUrl}/transporte-escolar/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...guiaPages,
    ...transporteCidadePages,
    ...tioPages,
  ];
}
