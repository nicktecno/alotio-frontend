import type { MetadataRoute } from 'next';
import {
  fetchAllApprovedTioIds,
  fetchAllCitiesWithTios,
  fetchNeighborhoodsForCity,
} from '@/lib/seo-transporte-api';
import { neighborhoodSlug } from '@/lib/slug';

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
      url: `${siteUrl}/transporte-escolar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
  ];

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
    priority: 0.72,
  }));

  const transporteBairroPages: MetadataRoute.Sitemap = [];
  const chunk = 12;
  for (let i = 0; i < citiesWithTios.length; i += chunk) {
    const slice = citiesWithTios.slice(i, i + chunk);
    const batches = await Promise.all(slice.map((c) => fetchNeighborhoodsForCity(c.id)));
    slice.forEach((c, j) => {
      for (const n of batches[j] ?? []) {
        transporteBairroPages.push({
          url: `${siteUrl}/transporte-escolar/${c.slug}/bairro/${neighborhoodSlug(n.name)}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.55,
        });
      }
    });
  }

  return [
    ...staticPages,
    ...transporteCidadePages,
    ...transporteBairroPages,
    ...tioPages,
  ];
}
