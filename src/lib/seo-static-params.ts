/**
 * Params pré-renderizados no build das rotas de SEO.
 *
 * Sem isto cada URL do sitemap ainda não visitada vira render on-demand, que
 * bate na API e acorda o compute do Neon — o rastreamento contínuo dos
 * buscadores mantém o banco ativo 24/7. Pré-renderizando, o trabalho de banco
 * fica concentrado numa única janela de build.
 */
import {
  fetchAllApprovedTioIds,
  fetchAllCitiesWithTios,
  fetchNeighborhoodsForCity,
} from '@/lib/seo-transporte-api';
import { neighborhoodSlug } from '@/lib/slug';

function cap(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const MAX_CITY_PATHS = cap(process.env.SEO_PRERENDER_MAX_CITIES, 2_000);
const MAX_BAIRRO_PATHS = cap(process.env.SEO_PRERENDER_MAX_BAIRROS, 20_000);
const MAX_TIO_PATHS = cap(process.env.SEO_PRERENDER_MAX_TIOS, 20_000);

export async function cityStaticParams(): Promise<{ citySlug: string }[]> {
  const cities = await fetchAllCitiesWithTios();
  return cities
    .slice(0, MAX_CITY_PATHS)
    .map((c) => ({ citySlug: c.slug }));
}

export async function bairroStaticParams(): Promise<
  { citySlug: string; bairroSlug: string }[]
> {
  const cities = await fetchAllCitiesWithTios();
  const params: { citySlug: string; bairroSlug: string }[] = [];
  const chunk = 12;

  for (let i = 0; i < cities.length && params.length < MAX_BAIRRO_PATHS; i += chunk) {
    const slice = cities.slice(i, i + chunk);
    const batches = await Promise.all(
      slice.map((c) => fetchNeighborhoodsForCity(c.id)),
    );
    slice.forEach((c, j) => {
      const seen = new Set<string>();
      for (const n of batches[j] ?? []) {
        const bairroSlug = neighborhoodSlug(n.name);
        if (!bairroSlug || seen.has(bairroSlug)) continue;
        seen.add(bairroSlug);
        params.push({ citySlug: c.slug, bairroSlug });
      }
    });
  }

  return params.slice(0, MAX_BAIRRO_PATHS);
}

export async function tioStaticParams(): Promise<{ id: string }[]> {
  const ids = await fetchAllApprovedTioIds();
  return ids.slice(0, MAX_TIO_PATHS).map((id) => ({ id }));
}
