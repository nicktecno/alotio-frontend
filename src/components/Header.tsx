'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout, checkAuth, isLoading } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth().then(() => setLoaded(true));
  }, [checkAuth]);

  // Fecha o menu mobile quando a rota mudar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    router.push('/');
  };

  const panelHref =
    user?.role === 'ADMIN'
      ? '/admin'
      : user?.role === 'LOJISTA'
        ? '/lojista'
        : '/dashboard';

  return (
    <header className="bg-primary-700 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logoAloTioVector.svg"
              alt="Alô Tio"
              className="h-9 w-auto max-h-10 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/tios"
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                pathname === '/tios' || pathname.startsWith('/tios/')
                  ? 'bg-primary-800/80 text-white font-semibold'
                  : 'text-primary-100 hover:text-white hover:bg-primary-600/50 font-medium'
              }`}
            >
              Encontrar Transporte
            </Link>

            <Link
              href="/lojas"
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                pathname === '/lojas' || pathname.startsWith('/lojas/')
                  ? 'bg-primary-800/80 text-white font-semibold'
                  : 'text-primary-100 hover:text-white hover:bg-primary-600/50 font-medium'
              }`}
            >
              Lojas
            </Link>

            <Link
              href="/escolas-parceiras"
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                pathname === '/escolas-parceiras' || pathname.startsWith('/escolas-parceiras/')
                  ? 'bg-primary-800/80 text-white font-semibold'
                  : 'text-primary-100 hover:text-white hover:bg-primary-600/50 font-medium'
              }`}
            >
              Escolas Parceiras
            </Link>

            <Link
              href="/sindicatos"
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                pathname === '/sindicatos' || pathname.startsWith('/sindicatos/')
                  ? 'bg-primary-800/80 text-white font-semibold'
                  : 'text-primary-100 hover:text-white hover:bg-primary-600/50 font-medium'
              }`}
            >
              Sindicatos & Associações
            </Link>

            <Link
              href="/seguro"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                pathname === '/seguro'
                  ? 'bg-primary-800/80 text-amber-300 font-bold'
                  : 'text-amber-300 hover:text-amber-200 hover:bg-primary-600/50 font-semibold'
              }`}
            >
              <span>🛡️</span>
              <span>Proteção Veicular</span>
            </Link>

            {/* Divider */}
            <div className="h-5 w-px bg-primary-600/60 mx-1.5 hidden lg:block" />

            {loaded && !isLoading && (
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    {user.role === 'ADMIN' ? (
                      <Link
                        href="/admin"
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary-800/90 text-white hover:bg-primary-900 transition"
                      >
                        Painel Admin
                      </Link>
                    ) : (
                      <Link
                        href={panelHref}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary-800/90 text-white hover:bg-primary-900 transition"
                      >
                        Meu Painel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-primary-200 hover:text-red-300 transition font-medium cursor-pointer text-sm px-2.5 py-1.5 rounded-lg hover:bg-primary-600/40"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-primary-100 hover:text-white hover:bg-primary-600/50 px-3 py-1.5 rounded-lg transition font-medium text-sm"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/cadastro"
                      className="bg-secondary hover:bg-secondary-600 text-white px-3.5 py-1.5 rounded-xl transition font-bold text-sm shadow-sm"
                    >
                      Cadastrar
                    </Link>
                  </>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Actions: Botão de ação rápida + Botão Sanduíche */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href={user ? panelHref : '/login'}
              className="bg-secondary hover:bg-secondary-600 text-white px-3 py-1.5 rounded-lg transition text-xs font-semibold"
            >
              {user ? 'Painel' : 'Entrar'}
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
              aria-expanded={isMobileMenuOpen}
              className="text-primary-100 hover:text-white p-2 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-primary-600/80 bg-primary-800 px-4 py-4 space-y-1 shadow-2xl">
          <Link
            href="/tios"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-100 hover:text-white hover:bg-primary-700 font-medium transition"
          >
            <span className="text-lg">🚐</span>
            <span>Encontrar transporte escolar</span>
          </Link>
          <Link
            href="/lojas"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-100 hover:text-white hover:bg-primary-700 font-medium transition"
          >
            <span className="text-lg">🏪</span>
            <span>Lojas</span>
          </Link>
          <Link
            href="/escolas-parceiras"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-100 hover:text-white hover:bg-primary-700 font-medium transition"
          >
            <span className="text-lg">🏫</span>
            <span>Escolas parceiras</span>
          </Link>
          <Link
            href="/sindicatos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-100 hover:text-white hover:bg-primary-700 font-medium transition"
          >
            <span className="text-lg">🏛️</span>
            <span>Sindicatos & Associações</span>
          </Link>
          <Link
            href="/seguro"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-primary-700 font-semibold transition"
          >
            <span className="text-lg">🛡️</span>
            <span>Proteção Veicular</span>
          </Link>

          {/* Seção de Autenticação no Mobile */}
          <div className="pt-4 mt-3 border-t border-primary-600/60">
            {loaded && !isLoading && (
              <>
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href={panelHref}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full bg-primary-600 hover:bg-primary-500 text-white py-2.5 rounded-lg font-semibold transition text-sm"
                    >
                      {user.role === 'ADMIN' ? 'Acessar Painel Admin' : 'Acessar Meu Painel'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center w-full text-red-300 hover:text-red-200 py-2 font-medium transition text-sm cursor-pointer"
                    >
                      Sair da conta
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center border border-primary-500 text-primary-100 hover:text-white py-2.5 rounded-lg font-medium transition text-sm hover:bg-primary-700"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/cadastro"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center bg-secondary hover:bg-secondary-600 text-white py-2.5 rounded-lg font-semibold transition text-sm shadow"
                    >
                      Cadastrar
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
