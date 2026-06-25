/** Parâmetros de busca em /tios (query string). */
export type TiosSearchUrlParams = {
  stateId?: string;
  cityId?: string;
  neighborhoodId?: string;
  schoolId?: string;
  page?: number;
};

/** Link para /tios com filtros pré-preenchidos (GEO → busca). */
export function tiosSearchHref(params: TiosSearchUrlParams): string {
  const q = new URLSearchParams();
  if (params.stateId?.trim()) q.set('stateId', params.stateId.trim());
  if (params.cityId?.trim()) q.set('cityId', params.cityId.trim());
  if (params.neighborhoodId?.trim()) {
    q.set('neighborhoodId', params.neighborhoodId.trim());
  }
  if (params.schoolId?.trim()) q.set('schoolId', params.schoolId.trim());
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
