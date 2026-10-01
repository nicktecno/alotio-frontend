import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cadastro de Lojista | Alô Tio',
  robots: { index: false, follow: true },
};

export default function CadastroLojistaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
