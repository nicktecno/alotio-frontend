import { Suspense } from 'react';
import type { Metadata } from 'next';
import SindicatosClient from './SindicatosClient';

export const metadata: Metadata = {
  title: 'Sindicatos e Associações de Transporte Escolar no Brasil | Alô Tio',
  description:
    'Encontre os sindicatos e associações de transporte escolar em cada cidade e estado. Conecte-se com a diretoria, conheça benefícios e condutores credenciados.',
};

export default function SindicatosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">Carregando sindicatos…</div>}>
      <SindicatosClient />
    </Suspense>
  );
}
