import { fetchAllCitiesWithTios } from '@/lib/seo-transporte-api';

/** Limite para não inflar demais a meta keywords (Google dá pouco peso a ela). */
const MAX_VAN_ESCOLAR_POR_CIDADE = 42;

/**
 * Frases de cauda longa derivadas das cidades com pelo menos um TIO aprovado (cadastro real).
 * Usado no metadata global (layout) para refletir regiões atendidas.
 */
export async function seoKeywordsFromRegisteredCities(): Promise<string[]> {
  const cities = await fetchAllCitiesWithTios();
  if (!cities.length) return [];

  const seen = new Set<string>();
  const out: string[] = [];

  const ufs = [
    ...new Set(
      cities
        .map((c) => c.state?.uf?.trim().toUpperCase())
        .filter((uf): uf is string => Boolean(uf)),
    ),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  for (const uf of ufs) {
    const k = `transporte escolar ${uf}`;
    const low = k.toLowerCase();
    if (!seen.has(low)) {
      seen.add(low);
      out.push(k);
    }
  }

  const sorted = [...cities].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR'),
  );

  let n = 0;
  for (const c of sorted) {
    if (n >= MAX_VAN_ESCOLAR_POR_CIDADE) break;
    const name = c.name.replace(/\s+/g, ' ').trim();
    if (!name) continue;
    const k = `van escolar ${name}`;
    const low = k.toLowerCase();
    if (seen.has(low)) continue;
    seen.add(low);
    out.push(k);
    n++;
  }

  return out;
}
