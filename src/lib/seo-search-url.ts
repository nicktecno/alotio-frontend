/** Parâmetros legíveis de busca em /tios (query string). */
export type TiosSearchUrlParams = {
  /** UF do estado, ex.: SP */
  uf?: string;
  /** Slug da cidade, ex.: sorocaba-sp */
  cidade?: string;
  /** Slug do bairro (nome normalizado), ex.: centro */
  bairro?: string;
  /** ID da escola (sem slug no banco) */
  escola?: string;
  page?: number;
};

function pickQuery(
  q: URLSearchParams,
  key: string,
  value: string | undefined,
): void {
  if (value?.trim()) q.set(key, value.trim());
}

/** Link para /tios com filtros pré-preenchidos (GEO → busca). */
export function tiosSearchHref(params: TiosSearchUrlParams): string {
  const q = new URLSearchParams();
  if (params.uf?.trim()) q.set('uf', params.uf.trim().toUpperCase());
  if (params.cidade?.trim()) q.set('cidade', params.cidade.trim().toLowerCase());
  if (params.bairro?.trim()) q.set('bairro', params.bairro.trim().toLowerCase());
  pickQuery(q, 'escola', params.escola);
  if (params.page != null && params.page > 1) {
    q.set('page', String(params.page));
  }
  const s = q.toString();
  return s ? `/tios?${s}` : '/tios';
}

/**
 * Atualiza a barra de endereço sem navegar (sem novo SSR na Vercel).
 */
export function syncTiosSearchUrl(params: TiosSearchUrlParams): void {
  if (typeof window === 'undefined') return;
  const next = tiosSearchHref(params);
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== next) {
    window.history.replaceState(null, '', next);
  }
}
