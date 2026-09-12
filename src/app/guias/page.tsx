import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ARTICLES } from '@/lib/articles-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

export const metadata: Metadata = {
  title: 'Guias e Dicas sobre Transporte Escolar — Alô Tio',
  description:
    'Artigos, orientações de segurança, legislação do CTB, direitos do consumidor e dicas práticas para pais e condutores de transporte escolar.',
  alternates: {
    canonical: `${siteUrl}/guias`,
  },
  openGraph: {
    title: 'Guias e Dicas sobre Transporte Escolar — Alô Tio',
    description:
      'Artigos e orientações completas para pais e motoristas de van escolar.',
    url: `${siteUrl}/guias`,
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function GuiasHubPage() {
  const categories = Array.from(new Set(ARTICLES.map((a) => a.category)));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">Guias & Artigos</span>
        </nav>

        {/* Hero Header */}
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-800 mb-3">
            Central Educativa Alô Tio
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-primary-900 sm:text-4xl md:text-5xl">
            Guias, Legislação e Segurança no Transporte Escolar
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600 leading-relaxed">
            Conteúdo informativo e aprofundado produzido pela nossa equipe para auxiliar pais,
            responsáveis e condutores a garantirem um trajeto escolar com total segurança,
            amparo legal e tranquilidade.
          </p>
        </div>

        {/* Grid of Articles */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-primary-300"
            >
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">{article.readTime}</span>
                  </div>
                  <h2 className="font-heading text-xl font-bold text-gray-900 mb-3 leading-snug hover:text-primary transition">
                    <Link href={`/guias/${article.slug}`}>{article.title}</Link>
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <Link
                    href={`/guias/${article.slug}`}
                    className="text-sm font-bold text-primary hover:text-primary-700 inline-flex items-center gap-1"
                  >
                    Ler artigo →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Search CTA Box */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary-800 to-primary-600 p-8 sm:p-12 text-white shadow-lg">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
              Procurando transporte escolar regularizado para seu filho?
            </h2>
            <p className="text-primary-100 mb-6 text-base sm:text-lg leading-relaxed">
              Consulte gratuitamente condutores escolares cadastrados que atendem as escolas e bairros
              da sua cidade na plataforma Alô Tio.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/tios"
                className="rounded-lg bg-secondary px-6 py-3.5 font-bold text-white shadow hover:bg-secondary-600 transition"
              >
                Buscar transporte por escola
              </Link>
              <Link
                href="/transporte-escolar"
                className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3.5 font-semibold text-white hover:bg-white/20 transition"
              >
                Ver cidades atendidas
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
