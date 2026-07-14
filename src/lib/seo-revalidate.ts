/** ISR / Data Cache das páginas SEO (segundos). Padrão: 30 dias. */
export const SEO_REVALIDATE_SEC =
  parseInt(process.env.SEO_REVALIDATE_SEC ?? String(30 * 24 * 3_600), 10) ||
  30 * 24 * 3_600;

export function seoFetchInit(): RequestInit {
  return { next: { revalidate: SEO_REVALIDATE_SEC } };
}
