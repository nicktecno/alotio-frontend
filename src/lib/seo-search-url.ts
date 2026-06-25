/** Link para /tios com filtros pré-preenchidos (GEO → busca). */
export function tiosSearchHref(params: {
  stateId?: string;
  cityId?: string;
  neighborhoodId?: string;
}): string {
  const q = new URLSearchParams();
  if (params.stateId?.trim()) q.set('stateId', params.stateId.trim());
  if (params.cityId?.trim()) q.set('cityId', params.cityId.trim());
  if (params.neighborhoodId?.trim()) {
    q.set('neighborhoodId', params.neighborhoodId.trim());
  }
  const s = q.toString();
  return s ? `/tios?${s}` : '/tios';
}
