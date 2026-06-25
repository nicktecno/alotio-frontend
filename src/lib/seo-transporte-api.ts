/**
 * Fetches públicos (server) para páginas de SEO /transporte-escolar.
 */
import type { PaginatedResponse, TioPublicView } from '@/types';
import { seoFetchInit } from '@/lib/seo-revalidate';

const apiBase = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type CitySeo = {
  id: string;
  name: string;
  slug: string;
  stateId: string;
  state: { id: string; name: string; uf: string };
};

export type NeighborhoodSeo = {
  id: string;
  name: string;
  cityId: string;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, seoFetchInit());
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCityBySlug(slug: string): Promise<CitySeo | null> {
  const norm = slug.trim().toLowerCase();
  let data = await fetchJson<CitySeo>(
    `${apiBase()}/cities/${encodeURIComponent(norm)}`,
  );
  if (data?.slug) return data;

  // Fallback até API resolver slug curto (ex.: sorocaba → sorocaba-sp).
  if (!/-[a-z]{2}$/i.test(norm)) {
    const cities = await fetchAllCitiesWithTios();
    const matches = cities.filter(
      (c) => c.slug === norm || c.slug.startsWith(`${norm}-`),
    );
    if (matches.length === 1) return matches[0];
    const byUf = matches.filter(
      (c) => c.slug === `${norm}-${c.state.uf.toLowerCase()}`,
    );
    if (byUf.length === 1) return byUf[0];
  }

  return null;
}

export async function fetchAllCitiesWithTios(): Promise<CitySeo[]> {
  const out: CitySeo[] = [];
  let page = 1;
  let totalPages = 1;
  const base = apiBase();
  do {
    const url = `${base}/cities?withTios=true&page=${page}&limit=100`;
    const res = await fetchJson<{
      data?: CitySeo[];
      totalPages?: number;
    }>(url);
    if (!res?.data?.length) break;
    out.push(...res.data);
    totalPages = Math.max(1, res.totalPages ?? 1);
    page++;
  } while (page <= totalPages && page < 200);
  return out;
}

export async function fetchNeighborhoodsForCity(cityId: string): Promise<NeighborhoodSeo[]> {
  const out: NeighborhoodSeo[] = [];
  let page = 1;
  let totalPages = 1;
  const base = apiBase();
  do {
    const url = `${base}/neighborhoods?cityId=${encodeURIComponent(cityId)}&page=${page}&limit=100`;
    const res = await fetchJson<{
      data?: NeighborhoodSeo[];
      totalPages?: number;
    }>(url);
    if (!res?.data?.length) break;
    out.push(...res.data);
    totalPages = Math.max(1, res.totalPages ?? 1);
    page++;
  } while (page <= totalPages && page < 500);
  return out;
}

export type TiosGeoSearch = {
  data: TioPublicView[];
  total: number;
  totalPages: number;
};

/** Listagem pública para páginas GEO (ISR). */
export async function fetchTiosForGeo(filters: {
  cityId?: string;
  stateId?: string;
  neighborhoodId?: string;
  page?: number;
  limit?: number;
}): Promise<TiosGeoSearch> {
  const q = new URLSearchParams();
  q.set('page', String(filters.page ?? 1));
  q.set('limit', String(filters.limit ?? 12));
  if (filters.cityId) q.set('cityId', filters.cityId);
  if (filters.stateId) q.set('stateId', filters.stateId);
  if (filters.neighborhoodId) q.set('neighborhoodId', filters.neighborhoodId);

  const empty: TiosGeoSearch = { data: [], total: 0, totalPages: 0 };
  try {
    const res = await fetch(`${apiBase()}/tios?${q.toString()}`, seoFetchInit());
    if (!res.ok) return empty;
    const body = (await res.json()) as PaginatedResponse<TioPublicView>;
    return {
      data: body.data ?? [],
      total: body.total ?? 0,
      totalPages: body.totalPages ?? 0,
    };
  } catch {
    return empty;
  }
}
