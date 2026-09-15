'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMyProfile } from '@/lib/swr';

const links = [
  { href: '/dashboard', label: 'Visão Geral', icon: '📊' },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: '👤' },
  { href: '/dashboard/escolas', label: 'Escolas', icon: '🏫' },
  { href: '/dashboard/fotos', label: 'Fotos', icon: '📷' },
  { href: '/dashboard/assinatura', label: 'Assinatura', icon: '⭐' },
] as const;

const meuTransporteLinks = [
  { href: '/dashboard/meu-transporte', label: 'Meu transporte', icon: '🚐' },
  { href: '/dashboard/meu-transporte/dados', label: 'Dados do transportador', icon: '📋' },
  { href: '/dashboard/meu-transporte/responsaveis', label: 'Responsáveis e recibos', icon: '👨‍👩‍👧' },
  { href: '/dashboard/meu-transporte/contratos', label: 'Contratos', icon: '📝' },
] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function linkIsActive(pathname: string, href: string) {
  return pathname === href;
}

export default function DashboardSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { data: profile } = useMyProfile();

  const navContent = (
    <nav className="p-4 space-y-1">
      {links.map((link) => {
        const isActive = linkIsActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              isActive
                ? 'bg-primary-50 text-primary border border-primary-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-primary-800'
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}

      {profile && (
        <div className="pt-3 mt-2 border-t border-gray-200 space-y-0.5">
          <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Ferramentas adicionais
          </p>
          <Link
            href="/ferramentas/cartao-digital"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              linkIsActive(pathname, '/ferramentas/cartao-digital')
                ? 'bg-primary-50 text-primary border border-primary-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-primary-800'
            }`}
          >
            <span className="text-lg shrink-0">💳</span>
            <span className="leading-snug">Cartão digital</span>
          </Link>
          <Link
            href="/ferramentas/calculadora-mensalidade"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              linkIsActive(pathname, '/ferramentas/calculadora-mensalidade')
                ? 'bg-primary-50 text-primary border border-primary-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-primary-800'
            }`}
          >
            <span className="text-lg shrink-0">🧮</span>
            <span className="leading-snug">Calculadora de preço</span>
          </Link>
          {meuTransporteLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                linkIsActive(pathname, item.href)
                  ? 'bg-primary-50 text-primary border border-primary-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-primary-800'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="leading-snug">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
        {navContent}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="relative w-64 max-w-[80vw] bg-white h-full shadow-xl animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-sm font-semibold text-primary-700">Menu</span>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition"
                aria-label="Fechar menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
