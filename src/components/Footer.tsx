import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-900 mt-auto overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-w-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 md:gap-4 w-full min-w-0">
          <div className="flex justify-center md:justify-start shrink-0">
            <img
              src="/logoAloTioVector.svg"
              alt="Alô Tio"
              className="h-7 w-auto max-h-8 object-contain"
            />
          </div>
          <nav
            aria-label="Links do rodapé"
            className="w-full min-w-0 max-w-full flex flex-col items-center justify-center gap-2.5 text-sm text-center sm:flex-row sm:flex-wrap sm:gap-x-2.5 sm:gap-y-2 sm:justify-center md:max-w-2xl md:gap-x-3"
          >
            <Link
              href="/contato"
              className="text-primary-200 hover:text-white transition [overflow-wrap:anywhere]"
            >
              Fale Conosco
            </Link>
            <span className="text-primary-700 select-none hidden sm:inline" aria-hidden>
              |
            </span>
            <Link
              href="/transporte-escolar"
              className="text-primary-200 hover:text-white transition [overflow-wrap:anywhere] max-w-full"
            >
              Transporte escolar por cidade
            </Link>
            <span className="text-primary-700 select-none hidden sm:inline" aria-hidden>
              |
            </span>
            <a
              href="mailto:contato@alotio.com.br"
              className="text-primary-200 hover:text-white transition [overflow-wrap:anywhere] break-all sm:break-normal"
            >
              contato@alotio.com.br
            </a>
            <span className="text-primary-700 select-none hidden sm:inline" aria-hidden>
              |
            </span>
            <a
              href="https://www.instagram.com/alo.tio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 hover:text-white transition inline-flex items-center justify-center gap-1.5 shrink-0 [overflow-wrap:anywhere]"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>
          </nav>
          <p className="text-primary-100 text-sm text-center md:text-left px-1 [overflow-wrap:anywhere] text-balance">
            &copy; {new Date().getFullYear()} Alô Tio. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
