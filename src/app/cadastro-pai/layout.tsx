import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cadastro de Pai/Responsável | Alô Tio',
  robots: { index: false, follow: true },
};

export default function CadastroPaiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
