'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/contatos', label: 'Mensagens', icon: '✉️' },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: '💬' },
  { href: '/admin/avaliacoes', label: 'Avaliações', icon: '⭐' },
  { href: '/admin/perfis', label: 'Perfis', icon: '👤' },
  { href: '/admin/usuarios', label: 'Usuários', icon: '👥' },
  { href: '/admin/estados', label: 'Estados', icon: '🗺️' },
  { href: '/admin/cidades', label: 'Cidades', icon: '🏙️' },
  { href: '/admin/escolas', label: 'Escolas', icon: '🏫' },
  { href: '/admin/bairros', label: 'Bairros', icon: '📍' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();

  const navContent = (
    <>
      <div className="p-4 border-b border-gray-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-300">
          Administração
        </span>
      </div>
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
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
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="relative w-64 max-w-[80vw] bg-white h-full shadow-xl animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-300">
                Administração
              </span>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition"
                aria-label="Fechar menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
