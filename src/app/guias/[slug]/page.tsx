import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ARTICLES, getArticleBySlug, getAllArticleSlugs } from '@/lib/articles-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Artigo não encontrado' };

  return {
    title: `${article.title} — Alô Tio`,
    description: article.excerpt,
    keywords: article.tags,
    alternates: {
      canonical: `${siteUrl}/guias/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${siteUrl}/guias/${article.slug}`,
      locale: 'pt_BR',
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: article.tags,
    },
  };
}

export default async function GuiaSlugPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const relatedArticles = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Organization',
      name: article.author.name,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Alô Tio',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/bannerAlotio.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/guias/${article.slug}`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Guias & Artigos', item: `${siteUrl}/guias` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${siteUrl}/guias/${article.slug}` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link href="/guias" className="hover:text-primary">
            Guias & Artigos
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{article.category}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-md bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800 uppercase tracking-wide">
              {article.category}
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">{article.readTime}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            {article.title}
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-gray-600 leading-relaxed">
            {article.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-gray-200 py-4 text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                AT
              </div>
              <div>
                <p className="font-semibold text-gray-800">{article.author.name}</p>
                <p className="text-xs text-gray-500">{article.author.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p>
                Atualizado em{' '}
                <time dateTime={article.updatedAt}>
                  {new Date(article.updatedAt).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="space-y-6 text-gray-700 leading-relaxed text-base sm:text-lg">
            {article.content.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim();

              if (trimmed.startsWith('## ')) {
                return (
                  <h2
                    key={idx}
                    className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 pt-6 border-t border-gray-100"
                  >
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }

              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={idx}
                    className="font-heading text-xl sm:text-2xl font-semibold text-gray-800 pt-3"
                  >
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote
                    key={idx}
                    className="rounded-r-xl border-l-4 border-primary bg-primary-50/60 p-4 italic text-gray-800 text-base"
                  >
                    {trimmed.replace('> ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
                  </blockquote>
                );
              }

              if (trimmed.startsWith('- [ ]')) {
                const items = trimmed.split('\n');
                return (
                  <ul key={idx} className="space-y-2 rounded-xl bg-gray-50 border border-gray-200 p-5 text-sm sm:text-base">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-primary font-bold">☑</span>
                        <span>{item.replace('- [ ] ', '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
                const items = trimmed.split('\n');
                return (
                  <ul key={idx} className="list-disc list-inside space-y-2 pl-2">
                    {items.map((item, i) => {
                      const cleanItem = item.replace(/^[-*]\s+|\d+\.\s+/, '');
                      return (
                        <li key={i}>
                          <span dangerouslySetInnerHTML={{
                            __html: cleanItem
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          }} />
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              if (trimmed.startsWith('| ')) {
                // Simple Markdown Table renderer
                const rows = trimmed.split('\n').filter((r) => !r.includes(':---'));
                if (rows.length > 0) {
                  const headerCols = rows[0].split('|').filter(Boolean).map((c) => c.trim());
                  const bodyRows = rows.slice(1);
                  return (
                    <div key={idx} className="overflow-x-auto my-6">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {headerCols.map((h, i) => (
                              <th key={i} className="px-4 py-3 text-left font-bold text-gray-900 border-b">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {bodyRows.map((row, rIdx) => {
                            const cols = row.split('|').filter(Boolean).map((c) => c.trim());
                            return (
                              <tr key={rIdx} className="hover:bg-gray-50">
                                {cols.map((col, cIdx) => (
                                  <td key={cIdx} className="px-4 py-3 text-gray-700">
                                    <span dangerouslySetInnerHTML={{
                                      __html: col.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    }} />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              }

              if (trimmed === '---') {
                return <hr key={idx} className="my-6 border-gray-200" />;
              }

              return (
                <p
                  key={idx}
                  dangerouslySetInnerHTML={{
                    __html: trimmed
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  }}
                />
              );
            })}
          </div>

          {/* Tags */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tópicos:</span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* CTA Search in Article */}
        <div className="mt-10 rounded-2xl bg-primary-50 border border-primary-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-heading text-xl font-bold text-primary-900">
              Quer encontrar van escolar regularizada perto de você?
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Consulte gratuitamente condutores que atendem a escola do seu filho no Alô Tio.
            </p>
          </div>
          <Link
            href="/tios"
            className="shrink-0 rounded-lg bg-secondary px-6 py-3 font-bold text-white shadow hover:bg-secondary-600 transition text-sm"
          >
            Buscar condutores
          </Link>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
            Outros artigos recomendados
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relatedArticles.map((rel) => (
              <div
                key={rel.slug}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-primary-300 flex flex-col justify-between"
              >
                <div>
                  <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700">
                    {rel.category}
                  </span>
                  <h3 className="font-heading text-base font-bold text-gray-900 mt-2 mb-2 line-clamp-2">
                    <Link href={`/guias/${rel.slug}`}>{rel.title}</Link>
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{rel.excerpt}</p>
                </div>
                <Link
                  href={`/guias/${rel.slug}`}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Ler artigo →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
