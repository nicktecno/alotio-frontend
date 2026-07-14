/** ISR / Data Cache das páginas SEO (segundos): 30 dias. */
export const SEO_REVALIDATE_SEC = 2_592_000;

/**
 * Segment config (`export const revalidate`) em page/sitemap exige literal
 * numérico estático — use `2_592_000` no arquivo, não esta constante importada.
 * Esta constante serve só para `fetch(..., { next: { revalidate } })`.
 */
export function seoFetchInit(): RequestInit {
  return { next: { revalidate: SEO_REVALIDATE_SEC } };
}
