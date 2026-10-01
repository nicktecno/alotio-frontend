import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Esqueci minha senha | Alô Tio',
  robots: { index: false, follow: true },
};

export default function EsqueciSenhaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
