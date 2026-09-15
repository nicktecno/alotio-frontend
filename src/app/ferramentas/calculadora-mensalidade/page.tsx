import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MonthlyFeeCalculator from '@/components/MonthlyFeeCalculator';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

export const metadata: Metadata = {
  title: 'Calculadora de Mensalidade — Transporte Escolar | Alô Tio',
  description:
    'Calcule quanto cobrar no transporte escolar: combustível, manutenção da van, seguro, monitor e margem de lucro. Simulador gratuito de mensalidade por assento para condutor escolar.',
  alternates: {
    canonical: `${siteUrl}/ferramentas/calculadora-mensalidade`,
  },
  openGraph: {
    title: 'Calculadora de Mensalidade — Transporte Escolar',
    description:
      'Simulador gratuito para condutor escolar definir mensalidade justa por assento.',
    url: `${siteUrl}/ferramentas/calculadora-mensalidade`,
    locale: 'pt_BR',
    type: 'website',
  },
  keywords: [
    'calculadora transporte escolar',
    'quanto cobrar van escolar',
    'mensalidade transporte escolar',
    'preço perua escolar',
    'custo van escolar',
    'condutor escolar',
  ],
};

const faq = [
  {
    q: 'Como calcular o preço da mensalidade de transporte escolar?',
    a: 'Some os custos mensais (combustível, manutenção, seguro, salário do monitor e outros fixos), divida pelo número de assentos ocupados para obter o custo por aluno e aplique a margem de lucro desejada.',
  },
  {
    q: 'Quais custos incluir na mensalidade da van escolar?',
    a: 'Combustível conforme quilometragem e consumo, manutenção preventiva, proteção veicular, salário de monitor quando houver, IPVA e despesas administrativas rateadas.',
  },
  {
    q: 'A calculadora do Alô Tio é gratuita?',
    a: 'Sim. A simulação é gratuita e não exige cadastro. Ao criar perfil na plataforma, você poderá salvar simulações e divulgar seu serviço para pais.',
  },
];

export default function CalculadoraMensalidadePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Calculadora de Mensalidade — Transporte Escolar Alô Tio',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    description: metadata.description,
    url: `${siteUrl}/ferramentas/calculadora-mensalidade`,
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <Header />
      <main className="flex-1">
        <div className="bg-primary text-white py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <nav className="text-sm text-primary-200 mb-4">
              <Link href="/" className="hover:text-white">Início</Link>
              <span className="mx-2">/</span>
              <span className="text-white">Calculadora de mensalidade</span>
            </nav>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">
              Calculadora de mensalidade para transporte escolar
            </h1>
            <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
              Simule quanto cobrar por assento com base na quilometragem, consumo da van,
              manutenção, seguro e margem. Ideal para condutor escolar e dono de van
              escolar.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
          <MonthlyFeeCalculator variant="full" />

          <article className="mt-12 prose prose-gray max-w-none">
            <h2 className="font-heading text-2xl font-bold text-primary-900">
              Como usar a calculadora
            </h2>
            <ol className="mt-4 space-y-2 text-gray-700 list-decimal list-inside">
              <li>Informe a quilometragem média mensal da rota (ida e volta × dias úteis).</li>
              <li>Coloque o consumo da van em km/L e o preço atual do combustível.</li>
              <li>Inclua manutenção, seguro, monitor e outros custos fixos do mês.</li>
              <li>Defina quantos assentos estão ocupados e a margem de lucro desejada.</li>
              <li>Use o valor sugerido como referência ao negociar com as famílias.</li>
            </ol>

            <h2 className="font-heading text-2xl font-bold text-primary-900 mt-10">
              Perguntas frequentes
            </h2>
            <dl className="mt-6 space-y-6">
              {faq.map((item) => (
                <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5">
                  <dt className="font-bold text-gray-900">{item.q}</dt>
                  <dd className="mt-2 text-gray-600 leading-relaxed">{item.a}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 rounded-2xl bg-primary-50 border border-primary-100 p-6 text-center">
              <h3 className="font-heading text-xl font-bold text-primary-900">
                Cadastre-se no Alô Tio
              </h3>
              <p className="mt-2 text-gray-600">
                Apareça para pais que buscam transporte escolar na sua escola e bairro.
              </p>
              <Link
                href="/cadastro"
                className="inline-block mt-4 bg-secondary hover:bg-secondary-600 text-white font-bold px-8 py-3 rounded-lg transition"
              >
                Criar perfil gratuito
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
