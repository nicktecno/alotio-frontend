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
  /** Exibir foto/logo no cartão (padrão: sim). */
  showImage: boolean;
  /** URL ou data URL personalizada; null usa a imagem padrão quando showImage. */
  imageUrl: string | null;
};

/** Ilustração padrão de van quando o transportador não envia foto própria. */
export const DEFAULT_CARD_IMAGE = '/cartao-digital-van.svg';

export const DEFAULT_CARD_DATA: DigitalCardData = {
  displayName: 'Tio Carlos',
  prefixo: '0881',
  phone: '21992122559',
  schools: 'Colégio Adventista, Odete São Paio',
  neighborhoods: 'Colubandê, Alcântara',
  tagline: 'Transporte escolar legalizado',
  showImage: true,
  imageUrl: null,
};

export const CARD_FORMATS: { id: CardFormat; label: string; w: number; h: number }[] = [
  { id: 'story', label: 'Stories (9:16)', w: 1080, h: 1920 },
  { id: 'feed', label: 'Feed (4:5)', w: 1080, h: 1350 },
  { id: 'square', label: 'Quadrado (1:1)', w: 1080, h: 1080 },
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

export function profilePublicUrl(profileId?: string): string | null {
  if (!profileId) return null;
  return `${siteUrl}/tios/${profileId}`;
}

export function cardImageSrc(data: DigitalCardData): string | null {
  if (!data.showImage) return null;
  return data.imageUrl || DEFAULT_CARD_IMAGE;
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
    profile ? '' : null,
    profile ? `Perfil no Alô Tio: ${profile}` : null,
  ].filter((line) => line !== null);
  return lines.join('\n');
}

export function profileFromApi(
  profile: {
    id: string;
    displayName: string;
    prefixo: string;
    phone: string | null;
    avatarUrl?: string | null;
    vehiclePhotos?: { url: string }[];
    schools?: { school: { name: string } }[];
    neighborhoods?: { neighborhood: { name: string } }[];
    bio?: string | null;
  },
  resolveAssetUrl: (path: string | null | undefined) => string | null,
): DigitalCardData {
  const photo =
    resolveAssetUrl(profile.avatarUrl) ||
    resolveAssetUrl(profile.vehiclePhotos?.[0]?.url) ||
    null;

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
    showImage: true,
    imageUrl: photo,
  };
}
