import { Suspense } from 'react';
import type { Metadata } from 'next';
import TiosSearchClient from './TiosSearchClient';
import Loading from '@/components/Loading';

export const metadata: Metadata = {
  title: 'Buscar Transporte Escolar — Vans e Condutores por Escola e Cidade',
  description:
    'Encontre transporte escolar seguro para a escola do seu filho. Busque condutores escolares credenciados por estado, cidade, escola e bairro no Alô Tio.',
  alternates: { canonical: 'https://alotio.com.br/tios' },
};

/**
 * Shell 100% estático servido pela Edge CDN da Vercel.
 * Filtros de URL são lidos no client via useSearchParams em Suspense (0 CPU de Function).
 */
export const revalidate = 2_592_000;

export default function TiosPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TiosSearchClient />
    </Suspense>
  );
}
