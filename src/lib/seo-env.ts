/** URLs de redes (Instagram etc.) separadas por vírgula — ex.: https://instagram.com/alotio,https://... */
export function organizationSameAsUrls(): string[] {
  const raw = process.env.NEXT_PUBLIC_ORGANIZATION_SAME_AS ?? '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.startsWith('http'));
}
