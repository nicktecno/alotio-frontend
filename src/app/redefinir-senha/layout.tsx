import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redefinir senha | Alô Tio',
  robots: { index: false, follow: true },
};

export default function RedefinirSenhaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
