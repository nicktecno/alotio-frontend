import type { Metadata } from 'next';
import { SEO_CORE_KEYWORDS } from '@/lib/seo-keywords';

export const metadata: Metadata = {
  title: 'Buscar Transporte Escolar - Van Escolar por Escola e Cidade',
  description:
    'Busque transporte escolar por escola, cidade e bairro. Condutor escolar, van escolar e motoristas verificados na sua região. Serviço gratuito.',
  keywords: [
    ...SEO_CORE_KEYWORDS,
    'buscar transporte escolar',
    'encontrar van escolar',
    'transporte escolar por escola',
    'van escolar perto de mim',
    'transporte escolar seguro',
  ],
  openGraph: {
    title: 'Buscar Transporte Escolar | Alô Tio',
    description:
      'Busque transporte escolar por escola, cidade e bairro. Encontre profissionais de van escolar verificados.',
  },
};

export default function TiosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
