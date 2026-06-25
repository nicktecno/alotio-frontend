/** ISR das páginas SEO (segundos). Override: SEO_REVALIDATE_SEC no build/deploy. */
export const SEO_REVALIDATE_SEC =
  parseInt(process.env.SEO_REVALIDATE_SEC ?? '86400', 10) || 86_400;

export function seoFetchInit(): RequestInit {
  return { next: { revalidate: SEO_REVALIDATE_SEC } };
}
