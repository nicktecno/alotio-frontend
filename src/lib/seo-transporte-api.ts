/**
 * Fetches públicos (server) para páginas de SEO /transporte-escolar.
 */
import type { PaginatedResponse, TioPublicView } from '@/types';
import { neighborhoodSlug } from '@/lib/slug';
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

export type StateSeo = {
  id: string;
  name: string;
  uf: string;
};

export async function fetchStateByUf(uf: string): Promise<StateSeo | null> {
  const norm = uf.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(norm)) return null;
  return fetchJson<StateSeo>(`${apiBase()}/states/${encodeURIComponent(norm)}`);
}

export async function fetchCityBySlug(slug: string): Promise<CitySeo | null> {
  const norm = slug.trim().toLowerCase();
  const data = await fetchJson<CitySeo>(
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

/** Ids de todos os perfis aprovados (sitemap + pré-renderização). */
export async function fetchAllApprovedTioIds(): Promise<string[]> {
  const out: string[] = [];
  let page = 1;
  let totalPages = 1;
  const base = apiBase();
  do {
    const res = await fetchJson<{
      data?: { id: string }[];
      totalPages?: number;
    }>(`${base}/tios?page=${page}&limit=250`);
    if (!res?.data?.length) break;
    for (const t of res.data) {
      if (t?.id) out.push(t.id);
    }
    totalPages = Math.max(1, res.totalPages ?? 1);
    page++;
  } while (page <= totalPages && page <= 400);
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

export type ResolvedTiosSearchFilters = {
  stateId?: string;
  cityId?: string;
  neighborhoodId?: string;
  schoolId?: string;
  page?: number;
};

function pickSearchParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/**
 * Converte query legível (?uf=SP&cidade=sorocaba-sp) ou legada (?stateId=uuid) em IDs para a busca.
 */
export async function resolveTiosSearchParams(
  sp: Record<string, string | string[] | undefined>,
): Promise<ResolvedTiosSearchFilters> {
  const uf = pickSearchParam(sp, 'uf');
  const cidade = pickSearchParam(sp, 'cidade');
  const bairro = pickSearchParam(sp, 'bairro');
  const escola =
    pickSearchParam(sp, 'escola') ?? pickSearchParam(sp, 'schoolId');

  let stateId = pickSearchParam(sp, 'stateId');
  let cityId = pickSearchParam(sp, 'cityId');
  let neighborhoodId = pickSearchParam(sp, 'neighborhoodId');

  if (cidade) {
    const city = await fetchCityBySlug(cidade);
    if (city) {
      cityId = city.id;
      stateId = city.stateId;
    }
  } else if (uf && !stateId) {
    const state = await fetchStateByUf(uf);
    if (state) stateId = state.id;
  }

  if (bairro && cityId) {
    const neighborhoods = await fetchNeighborhoodsForCity(cityId);
    const normBairro = bairro.toLowerCase();
    const match = neighborhoods.find(
      (n) => neighborhoodSlug(n.name) === normBairro,
    );
    if (match) neighborhoodId = match.id;
  }

  const pageRaw = pickSearchParam(sp, 'page');
  let page: number | undefined;
  if (pageRaw) {
    const n = parseInt(pageRaw, 10);
    if (Number.isFinite(n) && n > 1) page = n;
  }

  return {
    stateId,
    cityId,
    neighborhoodId,
    schoolId: escola,
    page,
  };
}

