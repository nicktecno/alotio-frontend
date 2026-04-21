import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Fale com a equipe Alô Tio. Dúvidas sobre transporte escolar, cadastro de motoristas ou suporte à plataforma.',
  alternates: { canonical: `${siteUrl}/contato` },
  openGraph: {
    title: 'Contato | Alô Tio',
    description: 'Entre em contato com o Alô Tio.',
    url: `${siteUrl}/contato`,
  },
};

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
