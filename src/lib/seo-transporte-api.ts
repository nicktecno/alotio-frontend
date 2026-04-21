/**
 * Fetches públicos (server) para páginas de SEO /transporte-escolar.
 */
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
    const res = await fetch(url, { next: { revalidate: 86_400 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCityBySlug(slug: string): Promise<CitySeo | null> {
  const data = await fetchJson<CitySeo>(`${apiBase()}/cities/${encodeURIComponent(slug)}`);
  return data && data.slug ? data : null;
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
