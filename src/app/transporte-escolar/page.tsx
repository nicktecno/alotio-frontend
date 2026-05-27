import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { fetchAllCitiesWithTios } from '@/lib/seo-transporte-api';
import { SEO_CORE_KEYWORDS } from '@/lib/seo-keywords';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

const PAGE_DESCRIPTION =
  'Encontre e busque transporte escolar, condutor escolar e van escolar por cidade e bairro. Motoristas verificados e perua escolar na sua região. Busca gratuita no Alô Tio.';

export const metadata: Metadata = {
  title: 'Encontrar transporte escolar por cidade e bairro — condutor escolar',
  description: PAGE_DESCRIPTION,
  keywords: [
    ...SEO_CORE_KEYWORDS,
    'transporte escolar por bairro',
    'condutor escolar perto de mim',
    'van escolar por cidade',
  ],
  alternates: { canonical: `${siteUrl}/transporte-escolar` },
  openGraph: {
    title: 'Encontrar transporte escolar por cidade e bairro | Alô Tio',
    description:
      'Encontre condutor escolar, van escolar e transporte escolar verificados por região.',
    url: `${siteUrl}/transporte-escolar`,
    locale: 'pt_BR',
    type: 'website',
  },
};

export const revalidate = 86_400;

export default async function TransporteEscolarHubPage() {
  const cities = await fetchAllCitiesWithTios();
  const byUf = cities.reduce<Record<string, typeof cities>>((acc, c) => {
    const uf = c.state?.uf ?? 'BR';
    if (!acc[uf]) acc[uf] = [];
    acc[uf].push(c);
    return acc;
  }, {});
  const ufs = Object.keys(byUf).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Transporte escolar por cidade e bairro',
    description: PAGE_DESCRIPTION,
    url: `${siteUrl}/transporte-escolar`,
    isPartOf: { '@type': 'WebSite', name: 'Alô Tio', url: siteUrl },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <JsonLd data={webPageLd} />
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">Transporte escolar</span>
        </nav>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary-900 mb-4">
          Transporte escolar por cidade e bairro
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl leading-relaxed">
          O Alô Tio reúne <strong>condutores escolares</strong>, <strong>motoristas de van escolar</strong> e{' '}
          <strong>transporte escolar</strong> verificado. Escolha sua região abaixo para ver páginas com bairros e
          palavras-chave como <em>van escolar</em>, <em>perua escolar</em> e <em>tio da van</em> na sua cidade — depois
          use a busca para filtrar por escola.
        </p>

        <Link
          href="/tios"
          className="inline-block mb-10 bg-primary hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Ir para a busca de tios
        </Link>

        <h2 className="font-heading text-xl font-semibold text-gray-900 mb-4">Cidades com transportadores</h2>
        <div className="space-y-8">
          {ufs.map((uf) => (
            <section key={uf}>
              <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wide mb-3">{uf}</h3>
              <ul className="flex flex-wrap gap-2">
                {byUf[uf]
                  .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                  .map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/transporte-escolar/${c.slug}`}
                        className="inline-block px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-800 text-sm hover:border-primary hover:text-primary transition"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>

        {cities.length === 0 && (
          <p className="text-gray-500">Não foi possível carregar as cidades agora. Tente a busca em /tios.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
