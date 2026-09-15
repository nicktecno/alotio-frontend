import { digitsOnly, formatBrazilMobileMask } from '@/lib/br-input';

export type CardFormat = 'story' | 'square' | 'feed';

export type DigitalCardData = {
  displayName: string;
  prefixo: string;
  phone: string;
  schools: string;
  neighborhoods: string;
  profileId?: string;
  tagline: string;
};

export const DEFAULT_CARD_DATA: DigitalCardData = {
  displayName: 'Tio Carlos',
  prefixo: '0881',
  phone: '21992122559',
  schools: 'Colégio Adventista, Odete São Paio',
  neighborhoods: 'Colubandê, Alcântara',
  tagline: 'Transporte escolar legalizado',
};

export const CARD_FORMATS: { id: CardFormat; label: string; w: number; h: number }[] = [
  { id: 'story', label: 'Stories (9:16)', w: 1080, h: 1920 },
  { id: 'feed', label: 'Feed (4:5)', w: 1080, h: 1350 },
  { id: 'square', label: 'Quadrado (1:1)', w: 1080, h: 1080 },
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

export function profilePublicUrl(profileId?: string): string {
  if (profileId) return `${siteUrl}/tios/${profileId}`;
  return `${siteUrl}/cadastro`;
}

export function whatsAppUrl(phoneDigits: string, message?: string): string {
  const d = digitsOnly(phoneDigits, 11);
  if (!d) return '';
  const base = `https://wa.me/55${d}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function formatPhoneDisplay(phoneDigits: string): string {
  const d = digitsOnly(phoneDigits, 11);
  if (!d) return '';
  return formatBrazilMobileMask(d);
}

export function buildShareCaption(data: DigitalCardData): string {
  const phone = formatPhoneDisplay(data.phone);
  const profile = profilePublicUrl(data.profileId);
  const lines = [
    `🚐 ${data.displayName} — Transporte Escolar`,
    data.prefixo ? `Prefixo: ${data.prefixo}` : null,
    phone ? `WhatsApp: ${phone}` : null,
    data.schools ? `Escolas: ${data.schools}` : null,
    data.neighborhoods ? `Bairros: ${data.neighborhoods}` : null,
    '',
    `Perfil no Alô Tio: ${profile}`,
  ].filter(Boolean);
  return lines.join('\n');
}

export function profileFromApi(profile: {
  id: string;
  displayName: string;
  prefixo: string;
  phone: string | null;
  schools?: { school: { name: string } }[];
  neighborhoods?: { neighborhood: { name: string } }[];
  bio?: string | null;
}): DigitalCardData {
  return {
    displayName: profile.displayName,
    prefixo: profile.prefixo,
    phone: profile.phone || '',
    schools:
      profile.schools?.map((s) => s.school.name).slice(0, 4).join(', ') || '',
    neighborhoods:
      profile.neighborhoods?.map((n) => n.neighborhood.name).slice(0, 4).join(', ') ||
      '',
    profileId: profile.id,
    tagline: profile.bio?.slice(0, 80) || 'Transporte escolar legalizado',
  };
}
