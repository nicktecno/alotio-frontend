import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DigitalCardGenerator from '@/components/DigitalCardGenerator';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

export const metadata: Metadata = {
  title: 'Cartão de Visita Digital — Transporte Escolar | Alô Tio',
  description:
    'Crie cartão de visita digital grátis para transporte escolar: nome, prefixo, WhatsApp, escolas e QR code. Baixe PNG para Instagram Stories, feed e grupos de pais.',
  alternates: {
    canonical: `${siteUrl}/ferramentas/cartao-digital`,
  },
  openGraph: {
    title: 'Cartão de Visita Digital — Transporte Escolar',
    description:
      'Gerador gratuito de cartão digital para condutor escolar divulgar no Instagram e WhatsApp.',
    url: `${siteUrl}/ferramentas/cartao-digital`,
    locale: 'pt_BR',
    type: 'website',
  },
  keywords: [
    'cartão digital transporte escolar',
    'cartão de visita van escolar',
    'divulgar transporte escolar instagram',
    'condutor escolar marketing',
  ],
};

const faq = [
  {
    q: 'Para que serve o cartão digital do Alô Tio?',
    a: 'É uma imagem personalizada com seus dados de contato, escolas e bairros atendidos, com QR code para seu perfil. Ideal para bio do Instagram, Stories e grupos de WhatsApp de pais.',
  },
  {
    q: 'Preciso estar cadastrado para usar?',
    a: 'Não. Qualquer condutor pode montar o cartão manualmente. Se você tem perfil no Alô Tio, os dados são preenchidos automaticamente e o QR code aponta para sua página pública.',
  },
  {
    q: 'Quais formatos posso baixar?',
    a: 'Stories (9:16), feed (4:5) e quadrado (1:1), em PNG de alta resolução para redes sociais.',
  },
];

export default function CartaoDigitalPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <main className="flex-1">
        <div className="bg-primary text-white py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <nav className="text-sm text-primary-200 mb-4">
              <Link href="/" className="hover:text-white">Início</Link>
              <span className="mx-2">/</span>
              <Link href="/ferramentas/calculadora-mensalidade" className="hover:text-white">
                Ferramentas
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">Cartão digital</span>
            </nav>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">
              Cartão de visita digital para transporte escolar
            </h1>
            <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
              Crie em segundos um cartão com seu nome, prefixo, WhatsApp e escolas.
              Baixe para Instagram ou copie o texto para grupos de pais.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
          <DigitalCardGenerator variant="full" />

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/ferramentas/calculadora-mensalidade"
              className="text-primary font-semibold hover:underline"
            >
              Calculadora de mensalidade →
            </Link>
            <Link href="/cadastro" className="text-secondary font-semibold hover:underline">
              Criar perfil no Alô Tio →
            </Link>
          </div>

          <article className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-primary-900">
              Perguntas frequentes
            </h2>
            <dl className="mt-6 space-y-4">
              {faq.map((item) => (
                <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5">
                  <dt className="font-bold text-gray-900">{item.q}</dt>
                  <dd className="mt-2 text-gray-600 leading-relaxed">{item.a}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
