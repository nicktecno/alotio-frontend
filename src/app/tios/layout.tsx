import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buscar Transporte Escolar - Van Escolar por Escola e Cidade',
  description:
    'Busque transporte escolar por escola, cidade e bairro. Encontre motoristas de van escolar verificados e cadastrados na sua região. Serviço gratuito.',
  keywords: [
    'buscar transporte escolar',
    'encontrar van escolar',
    'transporte escolar por escola',
    'van escolar perto de mim',
    'tio da van',
    'motorista escolar',
    'transporte escolar seguro',
    'van escolar cadastrada',
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
