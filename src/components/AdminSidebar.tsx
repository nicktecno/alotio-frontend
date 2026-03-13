'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/perfis', label: 'Perfis', icon: '👤' },
  { href: '/admin/usuarios', label: 'Usuários', icon: '👥' },
  { href: '/admin/estados', label: 'Estados', icon: '🗺️' },
  { href: '/admin/cidades', label: 'Cidades', icon: '🏙️' },
  { href: '/admin/escolas', label: 'Escolas', icon: '🏫' },
  { href: '/admin/bairros', label: 'Bairros', icon: '📍' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
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
    </aside>
  );
}
