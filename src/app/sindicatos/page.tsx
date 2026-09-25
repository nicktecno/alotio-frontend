import type { Metadata } from 'next';
import SindicatosClient from './SindicatosClient';

export const metadata: Metadata = {
  title: 'Sindicatos e Associações de Transporte Escolar no Brasil | Alô Tio',
  description:
    'Encontre os sindicatos e associações de transporte escolar em cada cidade e estado. Conecte-se com a diretoria, conheça benefícios e condutores credenciados.',
};

export default function SindicatosPage() {
  return <SindicatosClient />;
}
