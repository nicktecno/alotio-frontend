import { Suspense } from 'react';
import type { Metadata } from 'next';
import LojasClient from './LojasClient';

export const metadata: Metadata = {
  title: 'Lojas de vans e peças | Alô Tio',
  description:
    'Encontre lojas que anunciam vans escolares e peças e acessórios para transporte escolar no Alô Tio.',
};

export default function LojasPage() {
  return (
    <Suspense fallback={null}>
      <LojasClient />
    </Suspense>
  );
}
