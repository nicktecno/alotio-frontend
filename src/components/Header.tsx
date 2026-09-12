'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout, checkAuth, isLoading } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth().then(() => setLoaded(true));
  }, [checkAuth]);

  const handleLogout = async () => {
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
    <header className="bg-primary-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logoAloTioVector.svg"
              alt="Alô Tio"
              className="h-9 w-auto max-h-10 object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/tios"
              className="text-primary-100 hover:text-white transition font-medium"
            >
              Encontrar transporte escolar
            </Link>
            <Link
              href="/lojas"
              className="text-primary-100 hover:text-white transition font-medium"
            >
              Lojas
            </Link>
            <Link
              href="/escolas-parceiras"
              className="text-primary-100 hover:text-white transition font-medium"
            >
              Escolas parceiras
            </Link>
            <Link
              href="/guias"
              className="text-primary-100 hover:text-white transition font-medium"
            >
              Guias & Dicas
            </Link>
            <Link
              href="/seguro"
              className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 transition font-semibold"
            >
              🛡️ Proteção Veicular
            </Link>
            {loaded && !isLoading && (
              <>
                {user ? (
                  <>
                    {user.role === 'ADMIN' ? (
                      <Link
                        href="/admin"
                        className="text-primary-100 hover:text-white transition font-medium"
                      >
                        Admin
                      </Link>
                    ) : (
                      <Link
                        href={panelHref}
                        className="text-primary-100 hover:text-white transition font-medium"
                      >
                        Meu Painel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-primary-200 hover:text-red-300 transition font-medium cursor-pointer"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-primary-100 hover:text-white transition font-medium"
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/cadastro"
                      className="bg-secondary hover:bg-secondary-600 text-white px-5 py-2 rounded-lg transition font-semibold"
                    >
                      Cadastrar
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="md:hidden">
            <Link
              href={user ? panelHref : '/login'}
              className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
            >
              {user ? 'Painel' : 'Entrar'}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
